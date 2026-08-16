"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const emptySubscribe = () => () => {};

export function Header() {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const totalCount = useCart((state) => state.getTotalCount());
  const openCart = useCart((state) => state.openCart);

  return (
    <header className="w-full flex flex-col">
      {/* 1. Верхняя информационная сервисная полоса */}
      <div className="bg-[#0F172A] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-[#06B6D4]" />
              <a
                href="tel:88005553535"
                className="hover:text-white transition-colors"
              >
                +7 (800) 555-35-35
              </a>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Пн–Вс: 09:00 – 21:00</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Бесплатная доставка от 5 000 ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Основная навигационная полоса */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
          {/* Логотип */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center shrink-0 hover:opacity-95 transition-opacity"
          >
            TechGear<span className="text-[#06B6D4] text-3xl leading-none">.</span>
          </Link>

          {/* Центрированный поиск (UI-заглушка) */}
          <div className="flex-1 max-w-lg mx-4 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск девайсов и аксессуаров..."
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#06B6D4] hover:bg-[#0891B2] text-white p-1.5 rounded-md transition-colors"
                aria-label="Искать"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Правый блок действий */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Ссылка на аккаунт/вход */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-slate-600" />
              <span className="hidden md:inline">Войти</span>
            </Link>

            {/* Кнопка открытия выдвижной корзины (CartDrawer) */}
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors relative cursor-pointer"
              aria-label="Открыть корзину"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline">Корзина</span>
              {isHydrated && totalCount > 0 && (
                <span className="bg-[#F59E0B] text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full font-mono animate-in fade-in">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
