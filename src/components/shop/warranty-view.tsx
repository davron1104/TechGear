"use client";

import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  Headphones,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/context/language-context";
import { getLocalizedHref } from "@/i18n";
import { ShopSettings, DEFAULT_SHOP_SETTINGS, getLocalizedShopField } from "@/lib/settings";

interface WarrantyViewProps {
  shopSettings?: ShopSettings;
}

export function WarrantyView({
  shopSettings = DEFAULT_SHOP_SETTINGS,
}: WarrantyViewProps) {
  const { t, locale } = useTranslation();

  const cleanPhone = shopSettings.phone.replace(/[^0-9+]/g, "");
  const localizedAddress = getLocalizedShopField(shopSettings.address, locale);
  const localizedWorkingHours = getLocalizedShopField(shopSettings.workingHours, locale);

  const steps = [
    {
      num: "01",
      title: t("warranty.step1Title"),
      desc: t("warranty.step1Description"),
    },
    {
      num: "02",
      title: t("warranty.step2Title"),
      desc: t("warranty.step2Description"),
    },
    {
      num: "03",
      title: t("warranty.step3Title"),
      desc: t("warranty.step3Description"),
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Хлебные крошки */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-slate-500"
      >
        <Link
          href={getLocalizedHref("/", locale)}
          className="hover:text-cyan-600 transition-colors"
        >
          {t("common.back") === "Назад" ? "Главная" : locale === "uz" ? "Bosh sahifa" : "Home"}
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-medium">{t("warranty.title")}</span>
      </nav>

      {/* Заголовок страницы */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          <span>TechGear Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t("warranty.title")}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed">
          {t("warranty.subtitle")}
        </p>
      </div>

      {/* Сетка условий */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Блок 1: Гарантийные условия */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-slate-300 transition-colors space-y-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              {t("warranty.obligationTitle")}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {t("warranty.obligationDescription")}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
              <h3 className="text-base font-semibold text-slate-900">
                {t("warranty.docsTitle")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("warranty.docsDescription")}
            </p>
          </div>
        </div>

        {/* Блок 2: Обмен и возврат */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-slate-300 transition-colors space-y-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <RotateCcw className="w-6 h-6" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              {t("warranty.returnTitle")}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {t("warranty.returnDescription")}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-600 shrink-0" />
              <h3 className="text-base font-semibold text-slate-900">
                {t("warranty.contactsTitle")}
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("warranty.contactsDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Блок 3: Порядок обращения по гарантии (шаги) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-cyan-600 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Workflow</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {t("warranty.processSectionTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden"
            >
              <div className="text-3xl font-black text-cyan-600/30">
                {step.num}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Блок 4: Контакты и консультации */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start gap-6 justify-between">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-xs font-semibold">
              <Headphones className="w-3.5 h-3.5" />
              <span>{t("warranty.contactsTitle")}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("warranty.contactsTitle")}
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              {t("warranty.contactsDescription")}
            </p>
          </div>

          {/* Список контактов */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm shrink-0 md:min-w-[320px]">
            {shopSettings.phone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors border border-slate-700/50"
              >
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-medium">{shopSettings.phone}</span>
              </a>
            )}

            {shopSettings.email && (
              <a
                href={`mailto:${shopSettings.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors border border-slate-700/50"
              >
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-medium truncate">{shopSettings.email}</span>
              </a>
            )}

            {localizedAddress && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700/50 sm:col-span-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">{localizedAddress}</span>
              </div>
            )}

            {localizedWorkingHours && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700/50 sm:col-span-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">{localizedWorkingHours}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
