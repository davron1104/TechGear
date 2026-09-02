"use client";

import { PackageX, RotateCcw } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { useTranslation } from "@/context/language-context";

interface ProductGridProps {
  products: Product[];
  onResetFilters: () => void;
  isSearchEmpty?: boolean;
  searchQuery?: string;
}

export function ProductGrid({
  products,
  onResetFilters,
  isSearchEmpty = false,
  searchQuery = "",
}: ProductGridProps) {
  const { t } = useTranslation();

  if (products.length === 0) {
    const description = isSearchEmpty
      ? t("catalog.noSearchResults", { query: searchQuery })
      : t("catalog.noFilterResults");
    const buttonText = isSearchEmpty ? t("catalog.clearSearch") : t("catalog.resetFilters");

    return (
      <div className="w-full py-16 px-4 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-slate-50 text-slate-400">
          <PackageX className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          {t("catalog.noProductsFound")}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm">
          {description}
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{buttonText}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
