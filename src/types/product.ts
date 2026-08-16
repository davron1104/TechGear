/**
 * Типы товаров и фильтрации для каталога TechGear
 */

export type AvailabilityStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  image: string;
  shortDescription: string;
  description: string;
  stock: number;
  brand: string;
  characteristics: Record<string, string>;
  createdAt: string;
}

export type SortOption = "popular" | "price_asc" | "price_desc";

export interface FilterState {
  categorySlug: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  sortBy: SortOption;
}
