/**
 * Типы товаров, категорий, фильтрации и локализации для каталога TechGear
 */

export type Locale = "ru" | "uz" | "en";

export interface ProductTranslationData {
  name?: string;
  shortDescription?: string;
  description?: string;
  characteristics?: Record<string, string>;
}

export interface ProductTranslations {
  uz?: ProductTranslationData;
  en?: ProductTranslationData;
}

export interface CategoryTranslationData {
  name?: string;
}

export interface CategoryTranslations {
  uz?: CategoryTranslationData;
  en?: CategoryTranslationData;
}

export type AvailabilityStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  categoryTranslations?: CategoryTranslations | null;
  price: number;
  image: string;
  images: string[];
  shortDescription: string;
  description: string;
  stock: number;
  brand: string;
  characteristics: Record<string, string>;
  translations?: ProductTranslations | null;
  isPopular?: boolean;
  createdAt: string;
}

export type LocalizedProduct = Product;

export type SortOption = "popular" | "price_asc" | "price_desc";

export interface FilterState {
  categorySlug: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  sortBy: SortOption;
}
