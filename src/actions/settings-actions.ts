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
