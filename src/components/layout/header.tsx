"use client";

import { useSyncExternalStore, useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  Clock,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { getLocalizedHref } from "@/i18n";
import { useCurrency } from "@/context/currency-context";

import { ShopSettings, DEFAULT_SHOP_SETTINGS } from "@/lib/settings";

const emptySubscribe = () => () => {};

interface HeaderProps {
  shopSettings?: ShopSettings;
}

export function Header({ shopSettings = DEFAULT_SHOP_SETTINGS }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslation();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const totalCount = useCart((state) => state.getTotalCount());
  const openCart = useCart((state) => state.openCart);

  const cleanPhone = shopSettings.phone.replace(/[^0-9+]/g, "");

  return (
    <>
      {/* 1. Верхняя информационная сервисная полоса */}
      <div
        className={`bg-[#0F172A] text-slate-300 text-xs py-2 px-4 border-b border-slate-800 transition-all ${
          shopSettings.stickyTopBar ? "sticky top-0 z-50 shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-[#06B6D4]" />
              <a
                href={`tel:${cleanPhone}`}
                className="hover:text-white transition-colors"
              >
                {shopSettings.phone}
              </a>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>{shopSettings.workingHours}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>
                {t("header.freeDeliveryBadge", {
                  threshold: formatPrice(shopSettings.freeDeliveryThresholdUzs),
                })}
              </span>
            </div>
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </div>
      </div>

      {/* 2. Основная навигационная полоса */}
      <header className="w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
          {/* Логотип */}
          <Link
            href={getLocalizedHref("/", locale)}
            className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center shrink-0 hover:opacity-95 transition-opacity"
          >
            TechGear<span className="text-[#06B6D4] text-3xl leading-none">.</span>
          </Link>

          {/* Центрированный поиск с поддержкой Suspense */}
          <div className="flex-1 max-w-lg mx-4 hidden sm:block">
            <Suspense
              fallback={
                <div className="relative">
                  <div className="w-full h-[42px] bg-slate-50 border border-slate-200 rounded-lg animate-pulse" />
                </div>
              }
            >
              <SearchBar />
            </Suspense>
          </div>

          {/* Правый блок действий */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Раздел пользователя: Вход / Личный кабинет с дропдауном */}
            {status === "loading" ? (
              <div className="w-20 h-9 bg-slate-100 animate-pulse rounded-lg" />
            ) : session?.user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer select-none"
                >
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="max-w-[120px] truncate hidden md:inline">
                    {session.user.name || t("nav.profile")}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 text-left">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {session.user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href={getLocalizedHref("/account", locale)}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{t("nav.profile")}</span>
                      </Link>

                      {session.user.role === "ADMIN" && (
                        <Link
                          href={getLocalizedHref("/admin", locale)}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>{t("nav.admin")}</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: getLocalizedHref("/", locale) });
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>{t("nav.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={getLocalizedHref("/login", locale)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-slate-600" />
                <span className="hidden md:inline">{t("nav.login")}</span>
              </Link>
            )}

            {/* Кнопка открытия выдвижной корзины (CartDrawer) */}
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors relative cursor-pointer"
              aria-label={t("header.cart")}
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline">{t("header.cart")}</span>
              {isHydrated && totalCount > 0 && (
                <span className="bg-[#F59E0B] text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full font-mono animate-in fade-in">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function SearchBar() {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  return <SearchBarForm key={currentSearch} initialSearch={currentSearch} />;
}

function SearchBarForm({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const { t, locale } = useTranslation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(getLocalizedHref(`/catalog?search=${encodeURIComponent(trimmed)}`, locale));
    } else {
      router.push(getLocalizedHref("/catalog", locale));
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative">
      <input
        type="text"
        placeholder={t("header.searchPlaceholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition-all"
      />
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#06B6D4] hover:bg-[#0891B2] text-white p-1.5 rounded-md transition-colors cursor-pointer"
        aria-label={t("common.search")}
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
