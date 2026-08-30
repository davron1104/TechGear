"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  DEFAULT_USD_EXCHANGE_RATE,
  USD_EXCHANGE_RATE_SETTING_KEY,
} from "@/lib/currency";
import { getExchangeRate } from "@/lib/currency-server";
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
 * Updates the USD exchange rate in the database (Admin only).
 * - Validates input with Zod.
 * - Enforces role-based access control.
 * - Does not alter base product prices in UZS.
 */
export async function updateExchangeRate(
  data: unknown
): Promise<ActionResponse<{ exchangeRate: number }>> {
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

    // Upsert into SystemSetting
    const setting = await prisma.systemSetting.upsert({
      where: { key: USD_EXCHANGE_RATE_SETTING_KEY },
      create: {
        key: USD_EXCHANGE_RATE_SETTING_KEY,
        value: rate.toString(),
      },
      update: {
        value: rate.toString(),
      },
    });

    const parsedRate = parseFloat(setting.value) || DEFAULT_USD_EXCHANGE_RATE;

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/settings");
      revalidatePath("/");
      revalidatePath("/catalog");
    } catch {}

    return {
      success: true,
      data: { exchangeRate: parsedRate },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Не удалось обновить курс валюты.";
    console.error("Update exchange rate error:", error);
    return {
      success: false,
      error: message,
    };
  }
}
