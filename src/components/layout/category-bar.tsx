"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DEFAULT_CATEGORIES } from "@/types/category";

export function CategoryBar() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <nav
      aria-label="Категории каталога"
      className="bg-white border-b border-slate-200 py-3"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Кнопка "Все товары" */}
          <Link
            href="/"
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeCategory
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-[#0F172A]"
            }`}
          >
            Все товары
          </Link>

          {/* Список категорий из ТЗ */}
          {DEFAULT_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-[#0F172A]"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
