import { Locale, DEFAULT_LOCALE, isValidLocale } from "./config";
import { Product, LocalizedProduct, ProductTranslations, CategoryTranslations } from "@/types/product";

import ruDict from "./dictionaries/ru.json";
import uzDict from "./dictionaries/uz.json";
import enDict from "./dictionaries/en.json";

export type Dictionary = typeof ruDict;

export const dictionaries: Record<Locale, Dictionary> = {
  ru: ruDict,
  uz: uzDict as unknown as Dictionary,
  en: enDict as unknown as Dictionary,
};

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;

export type TranslationKey = Join<PathsToStringProps<Dictionary>, ".">;

/**
 * Traverses an object using dot notation key path (e.g. "catalog.filters").
 */
function getValueByPath(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Replaces {{param}} template placeholders in the translation string.
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
}

/**
 * Gets a translated string for a given key and locale with automatic fallback:
 * 1. Look up in requested locale.
 * 2. If missing/empty and locale is not "ru", look up in "ru".
 * 3. If missing in "ru", return the raw key as a safe fallback without throwing.
 */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const safeLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const targetDict = dictionaries[safeLocale];
  const ruFallbackDict = dictionaries[DEFAULT_LOCALE];

  // 1. Try target locale
  let text = getValueByPath(targetDict, key);

  // 2. If missing and not Russian, fallback to Russian
  if ((text === undefined || text.trim() === "") && safeLocale !== DEFAULT_LOCALE) {
    text = getValueByPath(ruFallbackDict, key);
  }

  // 3. If still missing, return key safely
  if (text === undefined) {
    return key;
  }

  // 4. Interpolate variables
  return interpolate(text, params);
}

/**
 * Creates a bound translator function `t(key, params)` for a specific locale.
 */
export function createTranslator(locale: Locale) {
  return function t(key: TranslationKey | string, params?: Record<string, string | number>): string {
    return translate(locale, key, params);
  };
}

/**
 * Returns a localized copy of a Product based on the active locale.
 * Fallback priority: target locale -> base Russian fields.
 */
export function getLocalizedProduct(product: Product, locale: Locale): LocalizedProduct {
  if (locale === "ru") {
    return product;
  }

  const trans = product.translations?.[locale];
  const categoryTrans = product.categoryTranslations?.[locale];
  const localizedCategoryName =
    categoryTrans?.name?.trim() || product.categoryName;

  if (!trans) {
    return {
      ...product,
      categoryName: localizedCategoryName,
    };
  }

  return {
    ...product,
    name: trans.name?.trim() || product.name,
    categoryName: localizedCategoryName,
    shortDescription: trans.shortDescription?.trim() || product.shortDescription,
    description: trans.description?.trim() || product.description,
    characteristics:
      trans.characteristics && Object.keys(trans.characteristics).length > 0
        ? trans.characteristics
        : product.characteristics,
  };
}

/**
 * Returns localized product name based on active locale with fallback to base name.
 */
export function getLocalizedProductName(
  item: { name: string; translations?: ProductTranslations | null },
  locale: Locale
): string {
  if (locale === "ru" || !item.translations) {
    return item.name;
  }
  return item.translations[locale]?.name?.trim() || item.name;
}

/**
 * Returns a localized copy of a Category based on the active locale.
 */
export function getLocalizedCategory<
  T extends { name: string; slug: string; translations?: CategoryTranslations | null }
>(category: T, locale: Locale): T {
  if (locale === "ru" || !category.translations) {
    return category;
  }

  const trans = category.translations[locale];
  if (!trans || !trans.name?.trim()) {
    return category;
  }

  return {
    ...category,
    name: trans.name.trim(),
  };
}
