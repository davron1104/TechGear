"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { getLocalizedHref } from "@/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function CheckoutHeader() {
  const { t, locale } = useTranslation();
  const homeHref = getLocalizedHref("/", locale);

  return (
    <header className="w-full bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <Link
          href={homeHref}
          className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] hover:opacity-95 transition-opacity shrink-0"
        >
          TechGear<span className="text-[#06B6D4] text-2xl sm:text-3xl leading-none">.</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher variant="light" />
          <Link
            href={homeHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#06B6D4] transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("checkout.backToStore")}</span>
            <span className="sm:hidden">{t("checkout.backToStoreShort")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
