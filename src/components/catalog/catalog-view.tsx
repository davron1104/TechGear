"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { CatalogFilters } from "./catalog-filters";
import { ProductGrid } from "./product-grid";
import { FilterState, Product } from "@/types/product";
import { useTranslation } from "@/context/language-context";
import { getLocalizedHref } from "@/i18n";

interface CatalogViewProps {
  products: Product[];
  categorySlug?: string | null;
  categoryName?: string | null;
  search?: string;
}

export function CatalogView({
  products = [],
  categorySlug = null,
  categoryName = null,
  search,
}: CatalogViewProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();

  // Локальные фильтры цены (канонически в UZS), наличия и сортировки
  const [filterValues, setFilterValues] = useState<
    Omit<FilterState, "categorySlug">
  >({
    minPrice: null,
    maxPrice: null,
    inStockOnly: false,
    sortBy: "popular",
  });

  // Единый объект фильтров (категория из пропсов + локальные фильтры цены и сортировки)
  const filters: FilterState = useMemo(
    () => ({
      ...filterValues,
      categorySlug,
    }),
    [filterValues, categorySlug]
  );

  const handleFilterChange = (
    updater: (prev: FilterState) => FilterState
  ) => {
    const next = updater(filters);

    // Если изменилась категория, выполняем навигацию на соответствующий маршрут
    if (next.categorySlug !== categorySlug) {
      if (next.categorySlug) {
        router.push(getLocalizedHref(`/catalog/${next.categorySlug}`, locale), { scroll: false });
      } else {
        router.push(getLocalizedHref("/catalog", locale), { scroll: false });
      }
    }

    setFilterValues({
      minPrice: next.minPrice,
      maxPrice: next.maxPrice,
      inStockOnly: next.inStockOnly,
      sortBy: next.sortBy,
    });
  };

  const handleResetSearch = () => {
    if (categorySlug) {
      router.push(getLocalizedHref(`/catalog/${categorySlug}`, locale));
    } else {
      router.push(getLocalizedHref("/catalog", locale));
    }
  };

  const handleResetFilters = () => {
    setFilterValues({
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      sortBy: "popular",
    });
  };

  // Фильтрация и сортировка товаров (напрямую в базовой валюте UZS)
  const filteredProducts = useMemo(() => {
    return products
      .filter((product: Product) => {
        // 1. Фильтр по категории
        if (
          filters.categorySlug &&
          product.categorySlug !== filters.categorySlug
        ) {
          return false;
        }

        // 2. Фильтр по минимальной цене (канонически в UZS)
        if (filters.minPrice !== null && product.price < filters.minPrice) {
          return false;
        }

        // 3. Фильтр по максимальной цене (канонически в UZS)
        if (filters.maxPrice !== null && product.price > filters.maxPrice) {
          return false;
        }

        // 4. Фильтр "Только в наличии"
        if (filters.inStockOnly && product.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "price_asc") {
          return a.price - b.price;
        }
        if (filters.sortBy === "price_desc") {
          return b.price - a.price;
        }
        return 0; // "popular"
      });
  }, [products, filters]);

  const headerTitle = filters.categorySlug
    ? categoryName ||
      products.find((p) => p.categorySlug === filters.categorySlug)
        ?.categoryName ||
      t("catalog.title")
    : t("catalog.allProducts");

  const displayTitle = search
    ? categorySlug
      ? `${t("common.search")}: «${search}» (${categoryName || headerTitle})`
      : `${t("common.search")}: «${search}»`
    : headerTitle;

  return (
    <div id="catalog-grid" className="scroll-mt-24">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Боковая панель фильтров */}
        <CatalogFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalFound={filteredProducts.length}
        />

        {/* Сетка товаров */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">
                {displayTitle}
              </h2>
              {search && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 font-semibold cursor-pointer transition-colors"
                  title={t("catalog.resetFilters")}
                >
                  <span>{t("common.reset")}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {t("catalog.found", { count: filteredProducts.length })}
            </span>
          </div>

          <ProductGrid
            products={filteredProducts}
            onResetFilters={products.length === 0 ? handleResetSearch : handleResetFilters}
            isSearchEmpty={products.length === 0 && !!search}
            searchQuery={search}
          />
        </div>
      </div>
    </div>
  );
}
