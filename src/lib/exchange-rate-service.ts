import prisma from "@/lib/prisma";
import {
  DEFAULT_USD_EXCHANGE_RATE,
  USD_EXCHANGE_RATE_SETTING_KEY,
  USD_EXCHANGE_RATE_UPDATED_AT_KEY,
  USD_EXCHANGE_RATE_SOURCE_KEY,
} from "./currency";
import { revalidatePath } from "next/cache";

export const CBU_USD_API_URL = "https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/";
export const CBU_SOURCE_LABEL = "Центральный банк РУз (cbu.uz)";
export const MANUAL_SOURCE_LABEL = "Ручной ввод (Администратор)";

interface CbuCurrencyItem {
  id?: number;
  Code?: string;
  Ccy?: string;
  CcyNm_RU?: string;
  Nominal?: string;
  Rate?: string;
  Diff?: string;
  Date?: string;
}

export interface FetchCbuRateResult {
  rate: number;
  date?: string;
}

export interface SyncRateResult {
  success: boolean;
  exchangeRate?: number;
  updatedAt?: string;
  source?: string;
  error?: string;
}

/**
 * Fetches the official USD exchange rate from the Central Bank of Uzbekistan (CBU) API.
 * - Enforces timeout (default 8s).
 * - Validates status, JSON structure, and numerical range [1,000; 100,000].
 */
export async function fetchCbuUsdRate(timeoutMs = 8000): Promise<FetchCbuRateResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(CBU_USD_API_URL, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Ответ сервера ЦБ РУз не успешен: HTTP ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as unknown;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Неверный формат ответа от API ЦБ РУз (ожидался массив).");
    }

    const usdItem = data.find(
      (item: CbuCurrencyItem) => item?.Ccy?.toUpperCase() === "USD"
    ) || data[0];

    if (!usdItem || !usdItem.Rate) {
      throw new Error("Поле с курсом USD отсутствует в ответе API ЦБ РУз.");
    }

    const parsedRate = parseFloat(usdItem.Rate.replace(/\s/g, "").replace(",", "."));

    if (isNaN(parsedRate) || !Number.isFinite(parsedRate)) {
      throw new Error(`Не удалось преобразовать курс "${usdItem.Rate}" в число.`);
    }

    if (parsedRate < 1000 || parsedRate > 100000) {
      throw new Error(
        `Полученный курс (${parsedRate} сум) выходит за допустимые пределы [1 000; 100 000].`
      );
    }

    return {
      rate: Math.round(parsedRate * 100) / 100,
      date: usdItem.Date,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Превышено время ожидания ответа от сервера ЦБ РУз (${timeoutMs} мс).`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Synchronizes the USD exchange rate from CBU into the database.
 * Updates SystemSetting (USD_EXCHANGE_RATE, USD_EXCHANGE_RATE_UPDATED_AT, USD_EXCHANGE_RATE_SOURCE).
 * Revalidates cache across the storefront.
 */
export async function syncExchangeRateFromCbu(): Promise<SyncRateResult> {
  try {
    const { rate } = await fetchCbuUsdRate();
    const nowIso = new Date().toISOString();

    await prisma.$transaction([
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
          value: CBU_SOURCE_LABEL,
        },
        update: {
          value: CBU_SOURCE_LABEL,
        },
      }),
    ]);

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/settings");
      revalidatePath("/");
      revalidatePath("/catalog");
    } catch {}

    return {
      success: true,
      exchangeRate: rate,
      updatedAt: nowIso,
      source: CBU_SOURCE_LABEL,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Не удалось обновить курс из ЦБ РУз.";
    console.error("Failed to sync exchange rate from CBU:", error);
    return {
      success: false,
      error: message,
    };
  }
}
