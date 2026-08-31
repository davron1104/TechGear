import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  CurrencyType,
  DEFAULT_USD_EXCHANGE_RATE,
  USD_EXCHANGE_RATE_SETTING_KEY,
  USD_EXCHANGE_RATE_UPDATED_AT_KEY,
  USD_EXCHANGE_RATE_SOURCE_KEY,
  CURRENCY_COOKIE_NAME,
} from "./currency";

export interface ExchangeRateDetails {
  exchangeRate: number;
  updatedAt: string | null;
  source: string | null;
}

/**
 * Retrieves the current USD exchange rate from the database.
 * Falls back to DEFAULT_USD_EXCHANGE_RATE (12,500 UZS) if not set or on error.
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: USD_EXCHANGE_RATE_SETTING_KEY },
    });

    if (setting && setting.value) {
      const parsedRate = parseFloat(setting.value);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        return parsedRate;
      }
    }
  } catch (error) {
    console.error(
      "Failed to load USD exchange rate from database, using default:",
      error
    );
  }

  return DEFAULT_USD_EXCHANGE_RATE;
}

/**
 * Retrieves full details about the USD exchange rate (rate, updatedAt, source).
 */
export async function getExchangeRateDetails(): Promise<ExchangeRateDetails> {
  let exchangeRate = DEFAULT_USD_EXCHANGE_RATE;
  let updatedAt: string | null = null;
  let source: string | null = null;

  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            USD_EXCHANGE_RATE_SETTING_KEY,
            USD_EXCHANGE_RATE_UPDATED_AT_KEY,
            USD_EXCHANGE_RATE_SOURCE_KEY,
          ],
        },
      },
    });

    const rateSetting = settings.find((s) => s.key === USD_EXCHANGE_RATE_SETTING_KEY);
    const updatedSetting = settings.find((s) => s.key === USD_EXCHANGE_RATE_UPDATED_AT_KEY);
    const sourceSetting = settings.find((s) => s.key === USD_EXCHANGE_RATE_SOURCE_KEY);

    if (rateSetting && rateSetting.value) {
      const parsedRate = parseFloat(rateSetting.value);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        exchangeRate = parsedRate;
      }
    }

    if (updatedSetting && updatedSetting.value) {
      updatedAt = updatedSetting.value;
    }

    if (sourceSetting && sourceSetting.value) {
      source = sourceSetting.value;
    }
  } catch (error) {
    console.error("Failed to load USD exchange rate details from database:", error);
  }

  return { exchangeRate, updatedAt, source };
}

/**
 * Retrieves the user's selected currency from cookies on the server.
 * Defaults to "UZS" if the cookie is not present or invalid.
 */
export async function getServerCurrency(): Promise<CurrencyType> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
    if (cookieValue === "USD") {
      return "USD";
    }
  } catch (error) {
    // In environments where cookies() is not available (e.g. static generation or unit tests)
  }
  return "UZS";
}
