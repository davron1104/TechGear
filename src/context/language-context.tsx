"use client";

import React, { createContext, useContext, useState, useTransition, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Locale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isValidLocale,
  TranslationKey,
  createTranslator,
  translate,
} from "@/i18n";

interface LanguageContextValue {
  locale: Locale;
  isPending: boolean;
  setLocale: (newLocale: Locale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    isValidLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!isValidLocale(newLocale)) return;
      if (newLocale === locale) return;

      // 1. Оптимистично обновляем состояние на клиенте
      setLocaleState(newLocale);

      // 2. Устанавливаем cookie NEXT_LOCALE для всех маршрутов
      if (typeof document !== "undefined") {
        document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // 3. Запускаем ревалидацию серверных компонентов
      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router]
  );

  const t = useMemo(() => createTranslator(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      isPending,
      setLocale,
      t,
    }),
    [locale, isPending, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Безопасный fallback, если хук вызван вне провайдера
    return {
      locale: DEFAULT_LOCALE,
      isPending: false,
      setLocale: () => {},
      t: (key: TranslationKey | string, params?: Record<string, string | number>) =>
        translate(DEFAULT_LOCALE, key, params),
    };
  }
  return context;
}

/**
 * Convenience alias matching standard i18n hooks.
 */
export const useTranslation = useLanguage;
