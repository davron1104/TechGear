import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  CurrencyType,
  DEFAULT_USD_EXCHANGE_RATE,
  USD_EXCHANGE_RATE_SETTING_KEY,
  CURRENCY_COOKIE_NAME,
} from "./currency";

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
