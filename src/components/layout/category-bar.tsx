"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category, DEFAULT_CATEGORIES } from "@/types/category";
import { useTranslation } from "@/context/language-context";
import { getLocalizedCategory, getLocalizedHref } from "@/i18n";

interface CategoryBarProps {
  categories?: Category[];
}

export function CategoryBar({ categories = DEFAULT_CATEGORIES }: CategoryBarProps) {
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  const catalogHref = getLocalizedHref("/catalog", locale);

  return (
    <nav
      aria-label={t("catalog.categoriesNav")}
      className="bg-white border-b border-slate-200 py-3"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Кнопка "Все товары" */}
          <Link
            href={catalogHref}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              pathname === catalogHref
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-[#0F172A]"
            }`}
          >
            {t("catalog.allProducts")}
          </Link>

          {/* Список категорий */}
          {categories.map((category) => {
            const localized = getLocalizedCategory(category, locale);
            const categoryHref = getLocalizedHref(`/catalog/${category.slug}`, locale);
            const isActive = pathname === categoryHref;

            return (
              <Link
                key={category.id}
                href={categoryHref}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-[#0F172A]"
                }`}
              >
                {localized.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
