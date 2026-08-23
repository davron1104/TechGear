"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_CATEGORIES } from "@/types/category";

interface CategoryBarProps {
  categories?: { id: string; name: string; slug: string }[];
}

export function CategoryBar({ categories = DEFAULT_CATEGORIES }: CategoryBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Категории каталога"
      className="bg-white border-b border-slate-200 py-3"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Кнопка "Все товары" */}
          <Link
            href="/catalog"
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              pathname === "/catalog"
                ? "bg-[#0F172A] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-[#0F172A]"
            }`}
          >
            Все товары
          </Link>

          {/* Список категорий */}
          {categories.map((category) => {
            const isActive = pathname === `/catalog/${category.slug}`;
            return (
              <Link
                key={category.id}
                href={`/catalog/${category.slug}`}
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

