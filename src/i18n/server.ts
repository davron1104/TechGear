import { cookies, headers } from "next/headers";
import { Locale, DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isValidLocale } from "./config";

/**
 * Server-side helper to resolve the current locale from cookies or Accept-Language header.
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    // 1. Read from NEXT_LOCALE cookie
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

    if (isValidLocale(cookieValue)) {
      return cookieValue;
    }

    // 2. Read from Accept-Language header if no cookie set
    const headerStore = await headers();
    const acceptLanguage = headerStore.get("accept-language")?.toLowerCase() || "";

    if (acceptLanguage.includes("uz")) {
      return "uz";
    }
    if (acceptLanguage.includes("en")) {
      return "en";
    }

    return DEFAULT_LOCALE;
  } catch {
    // Safe fallback if called outside request scope (e.g. static generation)
    return DEFAULT_LOCALE;
  }
}
