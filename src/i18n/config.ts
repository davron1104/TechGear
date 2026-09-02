export const LOCALES = ["ru", "uz", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, { label: string; fullLabel: string; flag: string }> = {
  ru: {
    label: "RU",
    fullLabel: "Русский",
    flag: "🇷🇺",
  },
  uz: {
    label: "UZ",
    fullLabel: "O‘zbekcha",
    flag: "🇺🇿",
  },
  en: {
    label: "EN",
    fullLabel: "English",
    flag: "🇬🇧",
  },
};

/**
 * Type guard for checking if a string is a supported Locale.
 */
export function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === "string" && (LOCALES as readonly string[]).includes(locale);
}
