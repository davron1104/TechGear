"use client";

import React from "react";
import { useCurrency } from "@/context/currency-context";
import { useTranslation } from "@/context/language-context";

interface CurrencySwitcherProps {
  className?: string;
  variant?: "dark" | "light";
}

export function CurrencySwitcher({
  className = "",
  variant = "dark",
}: CurrencySwitcherProps) {
  const { currency, setCurrency, isPending } = useCurrency();
  const { t } = useTranslation();

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg border text-xs font-semibold select-none transition-opacity ${
        isPending ? "opacity-70" : "opacity-100"
      } ${
        isDark
          ? "bg-slate-900/80 border-slate-700/80 text-slate-400"
          : "bg-slate-100 border-slate-200 text-slate-600"
      } ${className}`}
      role="group"
      aria-label={t("header.currencyLabel")}
    >
      <button
        type="button"
        onClick={() => setCurrency("UZS")}
        aria-pressed={currency === "UZS"}
        className={`px-2 py-1 rounded-md transition-all duration-150 cursor-pointer ${
          currency === "UZS"
            ? isDark
              ? "bg-[#06B6D4] text-white shadow-xs font-bold"
              : "bg-[#06B6D4] text-white shadow-xs font-bold"
            : isDark
            ? "hover:text-slate-200 hover:bg-slate-800/50"
            : "hover:text-slate-900 hover:bg-slate-200/60"
        }`}
      >
        UZS
      </button>

      <button
        type="button"
        onClick={() => setCurrency("USD")}
        aria-pressed={currency === "USD"}
        className={`px-2 py-1 rounded-md transition-all duration-150 cursor-pointer ${
          currency === "USD"
            ? isDark
              ? "bg-[#06B6D4] text-white shadow-xs font-bold"
              : "bg-[#06B6D4] text-white shadow-xs font-bold"
            : isDark
            ? "hover:text-slate-200 hover:bg-slate-800/50"
            : "hover:text-slate-900 hover:bg-slate-200/60"
        }`}
      >
        USD
      </button>
    </div>
  );
}
