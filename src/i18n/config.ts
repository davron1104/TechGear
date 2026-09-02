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

/**
 * Prefix a path with the given locale if not already localized.
 * Leaves external URLs, anchors, api, admin, and already localized paths intact.
 * Example:
 *   getLocalizedHref("/catalog", "uz") => "/uz/catalog"
 *   getLocalizedHref("/product/x", "en") => "/en/product/x"
 *   getLocalizedHref("/uz/catalog", "ru") => "/ru/catalog"
 *   getLocalizedHref("/", "ru") => "/ru"
 *   getLocalizedHref("/admin", "uz") => "/admin"
 */
export function getLocalizedHref(path: string, locale: Locale): string {
  if (!path) return `/${locale}`;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("#") ||
    path.startsWith("/api") ||
    path.startsWith("/admin")
  ) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const localePrefixRegex = new RegExp(`^\\/(${LOCALES.join("|")})(\\/|$)`);
  if (localePrefixRegex.test(cleanPath)) {
    const stripped = cleanPath.replace(localePrefixRegex, "$2");
    return stripped === "" || stripped === "/" ? `/${locale}` : `/${locale}${stripped.startsWith("/") ? stripped : `/${stripped}`}`;
  }

  return cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
}
