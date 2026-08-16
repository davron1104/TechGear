"use client";

import { useState } from "react";
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp, Check } from "lucide-react";
import { FilterState, SortOption } from "@/types/product";
import { DEFAULT_CATEGORIES } from "@/types/category";

interface CatalogFiltersProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onReset: () => void;
  totalFound: number;
}

export function CatalogFilters({
  filters,
  onFilterChange,
  onReset,
  totalFound,
}: CatalogFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasActiveFilters =
    filters.categorySlug !== null ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.inStockOnly ||
    filters.sortBy !== "popular";

  const activeFiltersCount = [
    filters.categorySlug !== null,
    filters.minPrice !== null,
    filters.maxPrice !== null,
    filters.inStockOnly,
    filters.sortBy !== "popular",
  ].filter(Boolean).length;

  return (
    <aside className="w-full lg:w-72 shrink-0">
      {/* Кнопка открытия фильтров на мобильных экранах */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-sm shadow-xs"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#06B6D4]" />
            <span>Фильтры и сортировка</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#06B6D4] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Найдено: {totalFound}</span>
            {isMobileOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>
      </div>

      {/* Панель фильтров (Desktop всегда открыта, Mobile по клику) */}
      <div
        className={`${
          isMobileOpen ? "block" : "hidden"
        } lg:block bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6`}
      >
        {/* Заголовок сайдбара и сброс */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <SlidersHorizontal className="w-4 h-4 text-[#06B6D4]" />
            <span>Фильтры</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-[#06B6D4] hover:text-[#0891B2] flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить</span>
            </button>
          )}
        </div>

        {/* 1. Сортировка */}
        <div>
          <label
            htmlFor="sort-select"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5"
          >
            Сортировка
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange((prev) => ({
                ...prev,
                sortBy: e.target.value as SortOption,
              }))
            }
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] cursor-pointer"
          >
            <option value="popular">По популярности</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
          </select>
        </div>

        {/* 2. Категории */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Категория
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() =>
                onFilterChange((prev) => ({ ...prev, categorySlug: null }))
              }
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left ${
                filters.categorySlug === null
                  ? "bg-[#0F172A] text-white font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>Все категории</span>
              {filters.categorySlug === null && <Check className="w-4 h-4" />}
            </button>

            {DEFAULT_CATEGORIES.map((cat) => {
              const isSelected = filters.categorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onFilterChange((prev) => ({
                      ...prev,
                      categorySlug: isSelected ? null : cat.slug,
                    }))
                  }
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left ${
                    isSelected
                      ? "bg-[#0F172A] text-white font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Диапазон цен */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Цена (₽)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="От 0"
                min="0"
                value={filters.minPrice ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  onFilterChange((prev) => ({ ...prev, minPrice: val }));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="До 100 000"
                min="0"
                value={filters.maxPrice ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  onFilterChange((prev) => ({ ...prev, maxPrice: val }));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              />
            </div>
          </div>
        </div>

        {/* 4. Наличие */}
        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                onFilterChange((prev) => ({
                  ...prev,
                  inStockOnly: e.target.checked,
                }))
              }
              className="w-4 h-4 text-[#06B6D4] rounded-sm border-slate-300 focus:ring-[#06B6D4] cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700 select-none">
              Только в наличии
            </span>
          </label>
        </div>

        {/* Количество найденного (Desktop) */}
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
          Найдено товаров: <strong className="text-slate-900">{totalFound}</strong>
        </div>
      </div>
    </aside>
  );
}
