import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getExchangeRateDetails } from "@/lib/currency-server";
import { getShopSettings } from "@/lib/settings-server";
import { ExchangeRateForm } from "@/components/admin/settings/exchange-rate-form";
import { ShopSettingsForm } from "@/components/admin/settings/shop-settings-form";
import { ArrowLeft, Sliders, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Настройки системы и магазина — TechGear Admin",
  description: "Управление глобальными системными настройками, контактами, доставкой и курсом валют магазина TechGear.",
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { exchangeRate, updatedAt, source } = await getExchangeRateDetails();
  const shopSettings = await getShopSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Admin Top Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-[#0F172A] tracking-tight">
              TechGear
              <span className="text-[#06B6D4] font-normal"> Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-semibold">
              <Link
                href="/admin"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Обзор
              </Link>
              <Link
                href="/admin/categories"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Категории
              </Link>
              <Link
                href="/admin/products"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Товары
              </Link>
              <Link
                href="/admin/orders"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Заказы
              </Link>
              <Link
                href="/admin/settings"
                className="text-[#06B6D4] border-b-2 border-[#06B6D4] py-4"
              >
                Настройки
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> В магазин
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-[#06B6D4] border border-cyan-200">
                <Sliders className="w-3 h-3" /> Системные параметры
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Shield className="w-3 h-3 text-slate-500" /> Доступ: Администратор
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Настройки магазина и курсы валют
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Управление курсом пересчета USD к базовой валюте UZS, контактными данными, графиком работы и тарифами доставки.
            </p>
          </div>
        </div>

        {/* 1. Секция управления курсом валют */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              1. Курс валют (USD / UZS)
            </h2>
          </div>
          <ExchangeRateForm
            initialRate={exchangeRate}
            initialUpdatedAt={updatedAt}
            initialSource={source}
          />
        </section>

        {/* 2. Секция настроек магазина (контакты, режим работы, доставка) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              2. Параметры магазина и доставки
            </h2>
          </div>
          <ShopSettingsForm initialSettings={shopSettings} />
        </section>
      </main>
    </div>
  );
}
