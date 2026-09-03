import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerLocale } from "@/i18n/server";
import { getLocalizedHref, translate } from "@/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getPrivatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  robots: getPrivatePageRobots(),
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const homeHref = getLocalizedHref("/", locale);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      {/* 1. Минималистичная шапка: логотип, переключатель языка и ссылка возврата */}
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
              <span className="hidden sm:inline">{translate(locale, "checkout.backToStore")}</span>
              <span className="sm:hidden">{translate(locale, "checkout.backToStoreShort")}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Центрированная рабочая область */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </main>

      {/* 3. Компактный подвал */}
      <footer className="w-full py-6 px-4 border-t border-slate-200 bg-white text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>{translate(locale, "footer.copyright", { year: new Date().getFullYear() })}</span>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span className="hover:text-slate-700 transition-colors cursor-pointer">
              {translate(locale, "footer.privacyPolicy")}
            </span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors cursor-pointer">
              {translate(locale, "footer.termsOfService")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
