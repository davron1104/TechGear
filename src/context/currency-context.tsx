"use client";

import React, { createContext, useContext, useState, useTransition, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CurrencyType,
  CURRENCY_COOKIE_NAME,
  DEFAULT_USD_EXCHANGE_RATE,
  formatCurrency,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyType;
  exchangeRate: number;
  isPending: boolean;
  setCurrency: (newCurrency: CurrencyType) => void;
  formatPrice: (amountUzs: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

interface CurrencyProviderProps {
  children: React.ReactNode;
  initialCurrency?: CurrencyType;
  initialExchangeRate?: number;
}

export function CurrencyProvider({
  children,
  initialCurrency = "UZS",
  initialExchangeRate = DEFAULT_USD_EXCHANGE_RATE,
}: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<CurrencyType>(initialCurrency);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setCurrency = useCallback(
    (newCurrency: CurrencyType) => {
      if (newCurrency !== "UZS" && newCurrency !== "USD") return;
      if (newCurrency === currency) return;

      // 1. Оптимистично обновляем состояние на клиенте
      setCurrencyState(newCurrency);

      // 2. Устанавливаем cookie NEXT_CURRENCY для всех маршрутов
      if (typeof document !== "undefined") {
        document.cookie = `${CURRENCY_COOKIE_NAME}=${newCurrency}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // 3. Запускаем ревалидацию серверных компонентов
      startTransition(() => {
        router.refresh();
      });
    },
    [currency, router]
  );

  const formatPrice = useCallback(
    (amountUzs: number) => {
      return formatCurrency(amountUzs, currency, initialExchangeRate);
    },
    [currency, initialExchangeRate]
  );

  const value = useMemo(
    () => ({
      currency,
      exchangeRate: initialExchangeRate,
      isPending,
      setCurrency,
      formatPrice,
    }),
    [currency, initialExchangeRate, isPending, setCurrency, formatPrice]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Безопасный fallback, если хук вызван вне провайдера
    return {
      currency: "UZS",
      exchangeRate: DEFAULT_USD_EXCHANGE_RATE,
      isPending: false,
      setCurrency: () => {},
      formatPrice: (amountUzs: number) =>
        formatCurrency(amountUzs, "UZS", DEFAULT_USD_EXCHANGE_RATE),
    };
  }
  return context;
}
