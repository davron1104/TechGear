"use client";

import Link from "next/link";
import { ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/types/category";
import { useTranslation } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { getLocalizedCategory, getLocalizedHref } from "@/i18n";
import { ShopSettings, DEFAULT_SHOP_SETTINGS } from "@/lib/settings";

interface FooterProps {
  shopSettings?: ShopSettings;
}

export function Footer({ shopSettings = DEFAULT_SHOP_SETTINGS }: FooterProps) {
  const { t, locale } = useTranslation();
  const { formatPrice } = useCurrency();

  const cleanPhone = shopSettings.phone.replace(/[^0-9+]/g, "");

  return (
    <footer className="bg-[#0F172A] text-slate-400 mt-auto border-t border-slate-800">
      {/* Верхний блок с преимуществами */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{t("footer.originalDevices")}</h4>
              <p className="text-xs text-slate-400">{t("footer.originalDevicesSub")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{t("footer.fastDelivery")}</h4>
              <p className="text-xs text-slate-400">
                {t("footer.fastDeliverySub", {
                  threshold: formatPrice(shopSettings.freeDeliveryThresholdUzs),
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{t("footer.support247")}</h4>
              <p className="text-xs text-slate-400">{t("footer.support247Sub")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{t("footer.easyReturn")}</h4>
              <p className="text-xs text-slate-400">{t("footer.easyReturnSub")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Основной блок с колонками ссылок */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Колонка 1: О магазине */}
          <div className="space-y-4">
            <Link
              href={getLocalizedHref("/", locale)}
              className="text-2xl font-bold tracking-tight text-white flex items-center"
            >
              TechGear<span className="text-[#06B6D4] text-3xl leading-none">.</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Колонка 2: Каталог товаров */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {t("footer.catalogTitle")}
            </h3>
            <ul className="space-y-2 text-sm">
              {DEFAULT_CATEGORIES.map((category) => {
                const localized = getLocalizedCategory(category, locale);
                return (
                  <li key={category.id}>
                    <Link
                      href={getLocalizedHref(`/catalog/${category.slug}`, locale)}
                      className="hover:text-white transition-colors"
                    >
                      {localized.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Колонка 3: Покупателям */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {t("footer.customers")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={getLocalizedHref("/account", locale)} className="hover:text-white transition-colors">
                  {t("nav.profile")}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedHref("/login", locale)} className="hover:text-white transition-colors">
                  {t("nav.login")} / {t("nav.register")}
                </Link>
              </li>
              <li>
                <span className="text-slate-400">{t("footer.deliveryAndPayment")}</span>
              </li>
              <li>
                <span className="text-slate-400">{t("footer.warrantyAndService")}</span>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {t("footer.contactsTitle")}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <strong className="text-slate-300">{t("footer.phoneLabel")}</strong>{" "}
                <a
                  href={`tel:${cleanPhone}`}
                  className="hover:text-white text-[#06B6D4] font-medium"
                >
                  {shopSettings.phone}
                </a>
              </li>
              <li>
                <strong className="text-slate-300">{t("footer.emailLabel")}</strong>{" "}
                <a
                  href={`mailto:${shopSettings.email}`}
                  className="hover:text-white text-slate-300 transition-colors"
                >
                  {shopSettings.email}
                </a>
              </li>
              <li>
                <strong className="text-slate-300">{t("footer.workingHoursLabel")}</strong>{" "}
                <span>{shopSettings.workingHours}</span>
              </li>
              {shopSettings.address && (
                <li>
                  <strong className="text-slate-300">{t("footer.addressLabel")}</strong>{" "}
                  <span>{shopSettings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Нижний копирайт */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.standards")}</p>
        </div>
      </div>
    </footer>
  );
}
