import { Locale, DEFAULT_LOCALE } from "@/i18n";

export type CurrencyType = "UZS" | "USD";

export const DEFAULT_USD_EXCHANGE_RATE = 12500;
export const USD_EXCHANGE_RATE_SETTING_KEY = "USD_EXCHANGE_RATE";
export const USD_EXCHANGE_RATE_UPDATED_AT_KEY = "USD_EXCHANGE_RATE_UPDATED_AT";
export const USD_EXCHANGE_RATE_SOURCE_KEY = "USD_EXCHANGE_RATE_SOURCE";
export const CURRENCY_COOKIE_NAME = "NEXT_CURRENCY";

/**
 * Converts an amount in UZS to USD based on the provided exchange rate.
 * Rounds to 2 decimal places to avoid floating-point inaccuracies.
 */
export function convertUzsToUsd(
  amountUzs: number,
  exchangeRate: number = DEFAULT_USD_EXCHANGE_RATE
): number {
  const safeRate =
    typeof exchangeRate === "number" && !isNaN(exchangeRate) && exchangeRate > 0
      ? exchangeRate
      : DEFAULT_USD_EXCHANGE_RATE;

  const rawAmount = typeof amountUzs === "number" && !isNaN(amountUzs) ? amountUzs : 0;
  const converted = rawAmount / safeRate;

  // Round to 2 decimal places
  return Math.round(converted * 100) / 100;
}

/**
 * Formats a number as Uzbek Sum based on the current locale.
 * - ru: "1 500 000 сум"
 * - uz: "1 500 000 so'm"
 * - en: "1,500,000 UZS"
 */
export function formatUzs(amount: number, locale: Locale = DEFAULT_LOCALE): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const rounded = Math.round(safeAmount);

  if (locale === "en") {
    const formatted = rounded
      .toLocaleString("en-US")
      .replace(/[\u00A0\u202F]/g, " ");
    return `${formatted} UZS`;
  }

  if (locale === "uz") {
    const formatted = rounded
      .toLocaleString("ru-RU")
      .replace(/[\s\u00A0\u202F]/g, " ");
    return `${formatted} so'm`;
  }

  // Default: ru
  const formatted = rounded
    .toLocaleString("ru-RU")
    .replace(/[\s\u00A0\u202F]/g, " ");
  return `${formatted} сум`;
}

/**
 * Formats a number as US Dollars (e.g. "$120" or "$120.50").
 */
export function formatUsd(amount: number, _locale: Locale = DEFAULT_LOCALE): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const isInteger = safeAmount % 1 === 0;

  const formatted = safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `$${formatted}`;
}

/**
 * Centralized currency formatter.
 * If currency is "USD", converts from UZS using the provided exchange rate and formats as "$...".
 * If currency is "UZS", formats according to the provided locale ("... сум", "... so'm", "... UZS").
 */
export function formatCurrency(
  amountUzs: number,
  currency: CurrencyType = "UZS",
  exchangeRate: number = DEFAULT_USD_EXCHANGE_RATE,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (currency === "USD") {
    const usdAmount = convertUzsToUsd(amountUzs, exchangeRate);
    return formatUsd(usdAmount, locale);
  }

  return formatUzs(amountUzs, locale);
}
