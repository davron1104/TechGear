import { Locale, LOCALES, DEFAULT_LOCALE } from "@/i18n";

/**
 * Returns the canonical base URL of the application.
 * Reads from NEXT_PUBLIC_APP_URL or fallback APP_URL, defaults to localhost in dev.
 * Always strips trailing slashes.
 */
export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Normalizes a relative path for SEO:
 * - Ensures leading slash
 * - Removes any existing /ru, /uz, /en prefix
 * - Strips query parameters or hashes (canonical URLs must be clean)
 * - Removes trailing slash (except root)
 */
export function normalizeSeoPath(rawPath: string = ""): string {
  if (!rawPath || rawPath === "/") {
    return "";
  }

  // Remove query params and hash fragments
  let path = rawPath.split("?")[0].split("#")[0];

  // Ensure leading slash
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // Strip locale prefix if passed (e.g. /ru/catalog -> /catalog)
  for (const loc of LOCALES) {
    if (path === `/${loc}`) {
      return "";
    }
    if (path.startsWith(`/${loc}/`)) {
      path = path.slice(loc.length + 1);
      break;
    }
  }

  // Remove trailing slash if path is longer than 1 character
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path === "/" ? "" : path;
}

export interface I18nAlternatesOptions {
  path?: string;
  locale: Locale;
  includeXDefault?: boolean;
}

/**
 * Generates canonical URL and hreflang language alternates for Next.js Metadata API.
 */
export function getI18nAlternates({
  path = "",
  locale = DEFAULT_LOCALE,
  includeXDefault = false,
}: I18nAlternatesOptions) {
  const baseUrl = getBaseUrl();
  const cleanPath = normalizeSeoPath(path);

  const languages: Record<string, string> = {
    ru: `${baseUrl}/ru${cleanPath}`,
    uz: `${baseUrl}/uz${cleanPath}`,
    en: `${baseUrl}/en${cleanPath}`,
  };

  if (includeXDefault) {
    languages["x-default"] = `${baseUrl}/ru${cleanPath}`;
  }

  return {
    canonical: `${baseUrl}/${locale}${cleanPath}`,
    languages,
  };
}

/**
 * Maps app locale code to OpenGraph locale format.
 */
export function getOgLocale(locale: Locale): string {
  switch (locale) {
    case "uz":
      return "uz_UZ";
    case "en":
      return "en_US";
    case "ru":
    default:
      return "ru_RU";
  }
}

/**
 * Standard robots directive for private and transactional pages.
 */
export function getPrivatePageRobots() {
  return {
    index: false,
    follow: false,
  };
}
