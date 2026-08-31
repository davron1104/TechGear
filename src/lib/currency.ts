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
 * Formats a number as Uzbek Sum (e.g. "1 500 000 сум").
 */
export function formatUzs(amount: number): string {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  const formatted = Math.round(safeAmount)
    .toLocaleString("ru-RU")
    .replace(/\s/g, " ");

  return `${formatted} сум`;
}

/**
 * Formats a number as US Dollars (e.g. "$120" or "$120.50").
 */
export function formatUsd(amount: number): string {
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
 * If currency is "UZS", formats directly as "... сум".
 */
export function formatCurrency(
  amountUzs: number,
  currency: CurrencyType = "UZS",
  exchangeRate: number = DEFAULT_USD_EXCHANGE_RATE
): string {
  if (currency === "USD") {
    const usdAmount = convertUzsToUsd(amountUzs, exchangeRate);
    return formatUsd(usdAmount);
  }

  return formatUzs(amountUzs);
}
