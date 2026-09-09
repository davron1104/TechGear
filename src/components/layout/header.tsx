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
  Menu,
  X,
  Layers,
  ChevronRight,
  Truck,
  Wrench,
  LogIn,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/context/language-context";
import { getLocalizedHref, getLocalizedCategory } from "@/i18n";
import { useCurrency } from "@/context/currency-context";
import { Category, DEFAULT_CATEGORIES } from "@/types/category";
import { ShopSettings, DEFAULT_SHOP_SETTINGS, getLocalizedShopField } from "@/lib/settings";

const emptySubscribe = () => () => {};

interface HeaderProps {
  shopSettings?: ShopSettings;
  categories?: Category[];
}

export function Header({
  shopSettings = DEFAULT_SHOP_SETTINGS,
  categories = DEFAULT_CATEGORIES,
}: HeaderProps) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const { t, locale } = useTranslation();
  const { formatPrice } = useCurrency();

  // Закрытие десктопного меню профиля при клике вне элемента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Блокировка скролла страницы и обработка клавиши Escape при открытом мобильном меню (Drawer)
  useEffect(() => {
    if (!isMobileNavOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  // Обработка клавиши Escape при открытой строке мобильного поиска
  useEffect(() => {
    if (!isMobileSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileSearchOpen(false);
        searchButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileSearchOpen]);

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const totalCount = useCart((state) => state.getTotalCount());
  const openCart = useCart((state) => state.openCart);

  const cleanPhone = shopSettings.phone.replace(/[^0-9+]/g, "");

  const closeMobileNav = () => setIsMobileNavOpen(false);

  const getUserDisplayName = () => {
    if (session?.user?.role === "ADMIN") {
      return t("nav.adminRole");
    }
    return session?.user?.name || t("nav.profile");
  };

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
              <span>{getLocalizedShopField(shopSettings.workingHours, locale)}</span>
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
      <header className="w-full bg-white border-b border-slate-200 shadow-xs relative">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between gap-2 sm:gap-4">
          {/* Левый блок: Кнопка Burger меню (планшет/мобильный) + Логотип */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label={t("catalog.categoriesNav")}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              href={getLocalizedHref("/", locale)}
              className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center shrink-0 hover:opacity-95 transition-opacity"
            >
              TechGear<span className="text-[#06B6D4] text-3xl leading-none">.</span>
            </Link>
          </div>

          {/* Центрированный поиск (десктоп >= 1024px и планшет 768-1023px) */}
          <div className="flex-1 max-w-lg mx-2 md:mx-4 hidden md:block">
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
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Кнопка открытия мобильного поиска (< 768px) */}
            <button
              ref={searchButtonRef}
              type="button"
              onClick={() => {
                setIsMobileSearchOpen((prev) => {
                  const next = !prev;
                  if (!next) {
                    searchButtonRef.current?.focus();
                  }
                  return next;
                });
              }}
              className={`md:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
                isMobileSearchOpen ? "bg-slate-100 text-[#06B6D4]" : ""
              }`}
              aria-label={t("header.searchToggle")}
              aria-expanded={isMobileSearchOpen}
              aria-controls="mobile-search-panel"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Раздел пользователя: Вход / Личный кабинет с дропдауном */}
            {status === "loading" ? (
              <div className="w-10 sm:w-20 h-9 bg-slate-100 animate-pulse rounded-lg hidden sm:block" />
            ) : session?.user ? (
              <div className="relative hidden sm:block" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer select-none"
                >
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="max-w-[120px] truncate hidden md:inline">
                    {getUserDisplayName()}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 text-left">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {getUserDisplayName()}
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
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-slate-600" />
                <span className="hidden md:inline">{t("nav.login")}</span>
              </Link>
            )}

            {/* Кнопка открытия выдвижной корзины (CartDrawer) */}
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors relative cursor-pointer"
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

        {/* Раскрывающаяся строка мобильного поиска (< 768px) с плавной анимацией */}
        <div
          id="mobile-search-panel"
          className={`md:hidden transition-all duration-200 ease-in-out motion-reduce:transition-none grid ${
            isMobileSearchOpen
              ? "grid-rows-[1fr] opacity-100 visible border-t border-slate-100"
              : "grid-rows-[0fr] opacity-0 invisible delay-200 border-t-0"
          }`}
          aria-hidden={!isMobileSearchOpen}
          inert={!isMobileSearchOpen ? true : undefined}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5">
              <Suspense
                fallback={
                  <div className="w-full h-10 bg-white border border-slate-200 rounded-lg animate-pulse" />
                }
              >
                <SearchBar
                  autoFocus={isMobileSearchOpen}
                  onSearchSubmitted={() => {
                    setIsMobileSearchOpen(false);
                    searchButtonRef.current?.focus();
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Выдвижное адаптивное Burger Menu (Drawer) с z-[60], гарантированно выше Top Info Bar (z-50) */}
      <div
        id="mobile-navigation-drawer"
        className={`fixed inset-0 z-[60] overflow-hidden transition-all duration-300 ${
          isMobileNavOpen
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none delay-300"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("catalog.categoriesNav")}
      >
        {/* Полупрозрачный оверлей с плавным затемнением и размытием */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isMobileNavOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobileNav}
          aria-hidden="true"
        />

        {/* Выдвижная боковая панель слева */}
        <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
          <aside
            className={`w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Шапка меню */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <Link
                href={getLocalizedHref("/", locale)}
                onClick={closeMobileNav}
                className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center"
              >
                TechGear<span className="text-[#06B6D4] text-2xl leading-none">.</span>
              </Link>

              <button
                type="button"
                onClick={closeMobileNav}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label={t("common.cancel")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Прокручиваемое содержимое меню */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {/* Секция 1: КАТАЛОГ (CATALOG) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>{t("footer.catalogTitle")}</span>
                </div>

                <div className="space-y-1">
                  <Link
                    href={getLocalizedHref("/catalog", locale)}
                    onClick={closeMobileNav}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-900 hover:bg-slate-100 hover:text-[#06B6D4] transition-colors"
                  >
                    <span>{t("catalog.allProducts")}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {categories.map((category) => {
                    const localized = getLocalizedCategory(category, locale);
                    return (
                      <Link
                        key={category.id}
                        href={getLocalizedHref(`/catalog/${category.slug}`, locale)}
                        onClick={closeMobileNav}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                      >
                        <span>{localized.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Секция 2: ПОКУПАТЕЛЯМ (CUSTOMERS) */}
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>{t("footer.customers")}</span>
                </div>

                <div className="space-y-1">
                  {session?.user ? (
                    <>
                      <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <Link
                        href={getLocalizedHref("/account", locale)}
                        onClick={closeMobileNav}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{t("nav.profile")}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>

                      {session.user.role === "ADMIN" && (
                        <Link
                          href={getLocalizedHref("/admin", locale)}
                          onClick={closeMobileNav}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>{t("nav.admin")}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          closeMobileNav();
                          signOut({ callbackUrl: getLocalizedHref("/", locale) });
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>{t("nav.logout")}</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href={getLocalizedHref("/login", locale)}
                      onClick={closeMobileNav}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-900 hover:bg-slate-100 hover:text-[#06B6D4] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogIn className="w-4 h-4 text-[#06B6D4]" />
                        <span>
                          {t("nav.login")} / {t("nav.register")}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}

                  <Link
                    href={getLocalizedHref("/delivery", locale)}
                    onClick={closeMobileNav}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span>{t("footer.deliveryAndPayment")}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    href={getLocalizedHref("/warranty", locale)}
                    onClick={closeMobileNav}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Wrench className="w-4 h-4 text-slate-400" />
                      <span>{t("footer.warrantyAndService")}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Подвал меню: Контактная информация */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#06B6D4]" />
                <a
                  href={`tel:${cleanPhone}`}
                  className="hover:text-[#06B6D4] transition-colors"
                >
                  {shopSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>{getLocalizedShopField(shopSettings.workingHours, locale)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

interface SearchBarProps {
  autoFocus?: boolean;
  onSearchSubmitted?: () => void;
}

function SearchBar({ autoFocus = false, onSearchSubmitted }: SearchBarProps) {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  return (
    <SearchBarForm
      key={currentSearch}
      initialSearch={currentSearch}
      autoFocus={autoFocus}
      onSearchSubmitted={onSearchSubmitted}
    />
  );
}

interface SearchBarFormProps {
  initialSearch: string;
  autoFocus?: boolean;
  onSearchSubmitted?: () => void;
}

function SearchBarForm({
  initialSearch,
  autoFocus = false,
  onSearchSubmitted,
}: SearchBarFormProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const { t, locale } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(getLocalizedHref(`/catalog?search=${encodeURIComponent(trimmed)}`, locale));
    } else {
      router.push(getLocalizedHref("/catalog", locale));
    }
    if (onSearchSubmitted) {
      onSearchSubmitted();
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative">
      <input
        ref={inputRef}
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
