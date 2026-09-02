"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/context/language-context";

export function CheckoutHeader() {
  const { t } = useTranslation();

  return (
    <header className="w-full bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-[#0F172A] hover:opacity-95 transition-opacity"
        >
          TechGear<span className="text-[#06B6D4] text-3xl leading-none">.</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#06B6D4] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("checkout.backToStore")}</span>
          <span className="sm:hidden">{t("checkout.backToStoreShort")}</span>
        </Link>
      </div>
    </header>
  );
}
