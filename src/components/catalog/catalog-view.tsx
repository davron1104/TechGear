"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CatalogFilters } from "./catalog-filters";
import { ProductGrid } from "./product-grid";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { FilterState, Product } from "@/types/product";

interface CatalogViewProps {
  categorySlug?: string | null;
}

export function CatalogView({ categorySlug = null }: CatalogViewProps) {
  const router = useRouter();

  // Локальные фильтры цены, наличия и сортировки
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
        router.push(`/catalog/${next.categorySlug}`, { scroll: false });
      } else {
        router.push("/catalog", { scroll: false });
      }
    }

    setFilterValues({
      minPrice: next.minPrice,
      maxPrice: next.maxPrice,
      inStockOnly: next.inStockOnly,
      sortBy: next.sortBy,
    });
  };

  const handleResetFilters = () => {
    setFilterValues({
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      sortBy: "popular",
    });
  };

  // Фильтрация и сортировка товаров
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product: Product) => {
      // 1. Фильтр по категории
      if (
        filters.categorySlug &&
        product.categorySlug !== filters.categorySlug
      ) {
        return false;
      }

      // 2. Фильтр по минимальной цене
      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }

      // 3. Фильтр по максимальной цене
      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }

      // 4. Фильтр "Только в наличии"
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (filters.sortBy === "price_desc") {
        return b.price - a.price;
      }
      return 0; // "popular"
    });
  }, [filters]);

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
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              {filters.categorySlug
                ? MOCK_PRODUCTS.find(
                    (p) => p.categorySlug === filters.categorySlug
                  )?.categoryName || "Каталог товаров"
                : "Все товары"}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Показано: {filteredProducts.length} из {MOCK_PRODUCTS.length}
            </span>
          </div>

          <ProductGrid
            products={filteredProducts}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
}
