"use client";

import React from "react";
import { useLanguage } from "@/context/language-context";
import { LOCALES, Locale } from "@/i18n";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dark" | "light";
}

export function LanguageSwitcher({
  className = "",
  variant = "dark",
}: LanguageSwitcherProps) {
  const { locale, setLocale, isPending, t } = useLanguage();

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
      aria-label={t("header.languageLabel")}
    >
      {LOCALES.map((loc: Locale) => {
        const isActive = locale === loc;
        const label = loc.toUpperCase();

        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc)}
            aria-pressed={isActive}
            className={`px-2 py-1 rounded-md transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-[#06B6D4] text-white shadow-xs font-bold"
                : isDark
                ? "hover:text-slate-200 hover:bg-slate-800/50"
                : "hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
