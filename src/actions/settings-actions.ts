"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  DEFAULT_USD_EXCHANGE_RATE,
  USD_EXCHANGE_RATE_SETTING_KEY,
  USD_EXCHANGE_RATE_UPDATED_AT_KEY,
  USD_EXCHANGE_RATE_SOURCE_KEY,
} from "@/lib/currency";
import {
  getExchangeRate,
  getExchangeRateDetails,
  ExchangeRateDetails,
} from "@/lib/currency-server";
import {
  syncExchangeRateFromCbu,
  MANUAL_SOURCE_LABEL,
} from "@/lib/exchange-rate-service";
import {
  ShopSettings,
  SHOP_PHONE_KEY,
  SHOP_EMAIL_KEY,
  SHOP_ADDRESS_KEY,
  SHOP_WORKING_HOURS_KEY,
  DELIVERY_COST_UZS_KEY,
  FREE_DELIVERY_THRESHOLD_UZS_KEY,
  HOME_TEXT_BLOCK_KEY,
  HomeTextBlockSettings,
} from "@/lib/settings";
import { getShopSettings, getHomeTextBlockSettings } from "@/lib/settings-server";
import {
  updateShopSettingsSchema,
  updateHomeTextBlockSchema,
} from "@/lib/validations/settings";
import { revalidatePath } from "next/cache";

import { z } from "zod";

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fields?: Record<string, string[]> };

const updateExchangeRateSchema = z.object({
  rate: z
    .number({
      message: "Курс валюты должен быть числом",
    })
    .min(1000, "Курс USD не может быть меньше 1 000 сум")
    .max(100000, "Курс USD не может превышать 100 000 сум"),
});

/**
 * Asserts admin permissions or throws
 */
async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Доступ запрещен. Требуются права администратора.");
  }
  return session;
}

/**
 * Retrieves the current USD exchange rate (Admin).
 */
export async function getAdminExchangeRate(): Promise<
  ActionResponse<{ exchangeRate: number }>
> {
  try {
    await assertAdmin();
    const exchangeRate = await getExchangeRate();
    return {
      success: true,
      data: { exchangeRate },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Не удалось получить курс валюты.";
    console.error("Get admin exchange rate error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Retrieves full details of the USD exchange rate (Admin).
 */
export async function getAdminExchangeRateDetails(): Promise<
  ActionResponse<ExchangeRateDetails>
> {
  try {
    await assertAdmin();
    const details = await getExchangeRateDetails();
    return {
      success: true,
      data: details,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось получить подробности о курсе валюты.";
    console.error("Get admin exchange rate details error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Updates the USD exchange rate manually in the database (Admin only).
 * - Validates input with Zod.
 * - Enforces role-based access control.
 * - Records manual source label and timestamp.
 * - Does not alter base product prices in UZS.
 */
export async function updateExchangeRate(
  data: unknown
): Promise<
  ActionResponse<{
    exchangeRate: number;
    updatedAt?: string;
    source?: string;
  }>
> {
  try {
    await assertAdmin();

    const parseResult = updateExchangeRateSchema.safeParse(data);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Ошибка валидации курса валюты.",
        fields: parseResult.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const { rate } = parseResult.data;
    const nowIso = new Date().toISOString();

    // Upsert into SystemSetting
    const [rateSetting] = await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: USD_EXCHANGE_RATE_SETTING_KEY },
        create: {
          key: USD_EXCHANGE_RATE_SETTING_KEY,
          value: rate.toString(),
        },
        update: {
          value: rate.toString(),
        },
      }),
      prisma.systemSetting.upsert({
        where: { key: USD_EXCHANGE_RATE_UPDATED_AT_KEY },
        create: {
          key: USD_EXCHANGE_RATE_UPDATED_AT_KEY,
          value: nowIso,
        },
        update: {
          value: nowIso,
        },
      }),
      prisma.systemSetting.upsert({
        where: { key: USD_EXCHANGE_RATE_SOURCE_KEY },
        create: {
          key: USD_EXCHANGE_RATE_SOURCE_KEY,
          value: MANUAL_SOURCE_LABEL,
        },
        update: {
          value: MANUAL_SOURCE_LABEL,
        },
      }),
    ]);

    const parsedRate =
      parseFloat(rateSetting.value) || DEFAULT_USD_EXCHANGE_RATE;

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/settings");
      revalidatePath("/");
      revalidatePath("/catalog");
    } catch {}

    return {
      success: true,
      data: {
        exchangeRate: parsedRate,
        updatedAt: nowIso,
        source: MANUAL_SOURCE_LABEL,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось обновить курс валюты.";
    console.error("Update exchange rate error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Triggers an immediate fetch and synchronization of USD exchange rate from CBU (Admin only).
 */
export async function refreshExchangeRateFromCbu(): Promise<
  ActionResponse<{
    exchangeRate: number;
    updatedAt: string;
    source: string;
  }>
> {
  try {
    await assertAdmin();

    const result = await syncExchangeRateFromCbu();

    if (!result.success || !result.exchangeRate || !result.updatedAt || !result.source) {
      return {
        success: false,
        error: result.error || "Не удалось получить актуальный курс от ЦБ РУз.",
      };
    }

    return {
      success: true,
      data: {
        exchangeRate: result.exchangeRate,
        updatedAt: result.updatedAt,
        source: result.source,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось выполнить синхронизацию с ЦБ РУз.";
    console.error("Refresh exchange rate from CBU error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Retrieves the current shop settings (Admin only).
 */
export async function getAdminShopSettings(): Promise<ActionResponse<ShopSettings>> {
  try {
    await assertAdmin();
    const settings = await getShopSettings();
    return {
      success: true,
      data: settings,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Не удалось получить настройки магазина.";
    console.error("Get admin shop settings error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Updates shop settings in the database (Admin only).
 * - Validates input with Zod.
 * - Enforces role-based access control.
 * - Batch upserts into SystemSetting.
 * - Revalidates all relevant paths.
 */
export async function updateShopSettings(
  data: unknown
): Promise<ActionResponse<ShopSettings>> {
  try {
    await assertAdmin();

    const parseResult = updateShopSettingsSchema.safeParse(data);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Ошибка валидации настроек магазина.",
        fields: parseResult.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const {
      phone,
      email,
      address,
      workingHours,
      deliveryCostUzs,
      freeDeliveryThresholdUzs,
    } = parseResult.data;

    // Batch upsert into SystemSetting
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: SHOP_PHONE_KEY },
        create: { key: SHOP_PHONE_KEY, value: phone },
        update: { value: phone },
      }),
      prisma.systemSetting.upsert({
        where: { key: SHOP_EMAIL_KEY },
        create: { key: SHOP_EMAIL_KEY, value: email },
        update: { value: email },
      }),
      prisma.systemSetting.upsert({
        where: { key: SHOP_ADDRESS_KEY },
        create: { key: SHOP_ADDRESS_KEY, value: address },
        update: { value: address },
      }),
      prisma.systemSetting.upsert({
        where: { key: SHOP_WORKING_HOURS_KEY },
        create: { key: SHOP_WORKING_HOURS_KEY, value: workingHours },
        update: { value: workingHours },
      }),
      prisma.systemSetting.upsert({
        where: { key: DELIVERY_COST_UZS_KEY },
        create: { key: DELIVERY_COST_UZS_KEY, value: deliveryCostUzs.toString() },
        update: { value: deliveryCostUzs.toString() },
      }),
      prisma.systemSetting.upsert({
        where: { key: FREE_DELIVERY_THRESHOLD_UZS_KEY },
        create: {
          key: FREE_DELIVERY_THRESHOLD_UZS_KEY,
          value: freeDeliveryThresholdUzs.toString(),
        },
        update: { value: freeDeliveryThresholdUzs.toString() },
      }),
    ]);

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/settings");
      revalidatePath("/");
      revalidatePath("/checkout");
      revalidatePath("/catalog");
    } catch {}

    const updatedSettings: ShopSettings = {
      phone,
      email,
      address,
      workingHours,
      deliveryCostUzs,
      freeDeliveryThresholdUzs,
    };

    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Не удалось сохранить настройки магазина.";
    console.error("Update shop settings error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Retrieves the home page text block settings (Admin only).
 */
export async function getAdminHomeTextBlockSettings(): Promise<
  ActionResponse<HomeTextBlockSettings>
> {
  try {
    await assertAdmin();
    const settings = await getHomeTextBlockSettings();
    return {
      success: true,
      data: settings,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось получить настройки текстового блока главной страницы.";
    console.error("Get admin home text block settings error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Updates the home page text block settings in the database (Admin only).
 * - Validates input with Zod.
 * - Enforces role-based access control (ADMIN only).
 * - Upserts into SystemSetting under HOME_TEXT_BLOCK.
 * - Revalidates home page, admin settings and localized routes.
 */
export async function updateHomeTextBlockSettings(
  data: unknown
): Promise<ActionResponse<HomeTextBlockSettings>> {
  try {
    await assertAdmin();

    const parseResult = updateHomeTextBlockSchema.safeParse(data);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parseResult.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }

      return {
        success: false,
        error: "Ошибка валидации данных текстового блока.",
        fields: fieldErrors,
      };
    }


    const validData: HomeTextBlockSettings = parseResult.data;
    const jsonValue = JSON.stringify(validData);

    await prisma.systemSetting.upsert({
      where: { key: HOME_TEXT_BLOCK_KEY },
      create: { key: HOME_TEXT_BLOCK_KEY, value: jsonValue },
      update: { value: jsonValue },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/settings");
      revalidatePath("/");
      revalidatePath("/ru");
      revalidatePath("/uz");
      revalidatePath("/en");
    } catch {}

    return {
      success: true,
      data: validData,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось сохранить настройки текстового блока.";
    console.error("Update home text block settings error:", error);
    return {
      success: false,
      error: message,
    };
  }
}
