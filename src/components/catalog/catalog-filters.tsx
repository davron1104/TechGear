"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { FilterState, SortOption } from "@/types/product";
import { useCurrency } from "@/context/currency-context";
import { useTranslation } from "@/context/language-context";
import { convertUzsToUsd, CurrencyType } from "@/lib/currency";

interface CatalogFiltersProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onReset: () => void;
  totalFound: number;
}

function toDisplayString(
  canonicalUzs: number | null,
  currency: CurrencyType,
  exchangeRate: number
): string {
  if (canonicalUzs === null || canonicalUzs === undefined) return "";
  if (currency === "USD") {
    const usd = convertUzsToUsd(canonicalUzs, exchangeRate);
    return usd !== 0 ? usd.toString() : "0";
  }
  return Math.round(canonicalUzs).toString();
}

export function CatalogFilters({
  filters,
  onFilterChange,
  onReset,
  totalFound,
}: CatalogFiltersProps) {
  const { currency, exchangeRate } = useCurrency();
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [minInputStr, setMinInputStr] = useState(() =>
    toDisplayString(filters.minPrice, currency, exchangeRate)
  );
  const [maxInputStr, setMaxInputStr] = useState(() =>
    toDisplayString(filters.maxPrice, currency, exchangeRate)
  );

  // Синхронизация отображаемых строк при смене валюты, изменении курса или внешнем сбросе фильтров
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinInputStr(toDisplayString(filters.minPrice, currency, exchangeRate));
    setMaxInputStr(toDisplayString(filters.maxPrice, currency, exchangeRate));
  }, [currency, exchangeRate, filters.minPrice === null, filters.maxPrice === null]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMinInputStr(raw);

    const trimmed = raw.trim();
    if (!trimmed || isNaN(Number(trimmed))) {
      onFilterChange((prev) => ({ ...prev, minPrice: null }));
      return;
    }

    const num = Number(trimmed);
    if (num < 0) {
      onFilterChange((prev) => ({ ...prev, minPrice: 0 }));
      return;
    }

    const canonicalUzs = currency === "USD" ? num * exchangeRate : num;
    onFilterChange((prev) => ({ ...prev, minPrice: canonicalUzs }));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMaxInputStr(raw);

    const trimmed = raw.trim();
    if (!trimmed || isNaN(Number(trimmed))) {
      onFilterChange((prev) => ({ ...prev, maxPrice: null }));
      return;
    }

    const num = Number(trimmed);
    if (num < 0) {
      onFilterChange((prev) => ({ ...prev, maxPrice: 0 }));
      return;
    }

    const canonicalUzs = currency === "USD" ? num * exchangeRate : num;
    onFilterChange((prev) => ({ ...prev, maxPrice: canonicalUzs }));
  };

  const hasActiveFilters =
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.inStockOnly ||
    filters.sortBy !== "popular";

  const activeFiltersCount = [
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
            <span>{t("catalog.filtersAndSort")}</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#06B6D4] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{t("catalog.found", { count: totalFound })}</span>
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
            <span>{t("catalog.filters")}</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-[#06B6D4] hover:text-[#0891B2] flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t("common.reset")}</span>
            </button>
          )}
        </div>

        {/* 1. Сортировка */}
        <div>
          <label
            htmlFor="sort-select"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5"
          >
            {t("catalog.sortBy")}
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
            <option value="popular">{t("catalog.sortPopular")}</option>
            <option value="price_asc">{t("catalog.sortPriceAsc")}</option>
            <option value="price_desc">{t("catalog.sortPriceDesc")}</option>
          </select>
        </div>

        {/* 3. Диапазон цен */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            {currency === "USD" ? t("catalog.priceFilterUsd") : t("catalog.priceFilterUzs")}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder={t("catalog.priceFrom")}
                min="0"
                step={currency === "USD" ? "any" : "1000"}
                value={minInputStr}
                onChange={handleMinChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder={currency === "USD" ? t("catalog.priceToUsd") : t("catalog.priceToUzs")}
                min="0"
                step={currency === "USD" ? "any" : "1000"}
                value={maxInputStr}
                onChange={handleMaxChange}
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
              {t("catalog.inStockOnly")}
            </span>
          </label>
        </div>

        {/* Количество найденного (Desktop) */}
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
          {t("catalog.found", { count: totalFound })}
        </div>
      </div>
    </aside>
  );
}
