"use client";

import { useTranslation } from "@/context/language-context";

export function CheckoutFooter() {
  const { t } = useTranslation();

  return (
    <footer className="w-full py-6 px-4 border-t border-slate-200 bg-white text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <div className="flex items-center gap-4 text-slate-500 text-xs">
          <span className="hover:text-slate-700 transition-colors cursor-pointer">
            {t("checkout.privacyPolicy")}
          </span>
          <span>•</span>
          <span className="hover:text-slate-700 transition-colors cursor-pointer">
            {t("checkout.termsOfService")}
          </span>
        </div>
      </div>
    </footer>
  );
}
