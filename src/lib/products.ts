import prisma from "@/lib/prisma";
import { Product } from "@/types/product";

interface PrismaProductWithCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  price: { toString(): string } | number;
  image: string;
  images: string[];
  shortDescription: string;
  description: string;
  stock: number;
  brand: string;
  characteristics: unknown;
  deletedAt?: Date | null;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Maps a Prisma Product (with included Category) to the frontend Product type.
 */
export function serializeProduct(item: PrismaProductWithCategory): Product {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    categoryId: item.categoryId,
    categorySlug: item.category.slug,
    categoryName: item.category.name,
    price: Number(item.price),
    image: item.image,
    images: item.images && item.images.length > 0 ? item.images : [item.image],
    shortDescription: item.shortDescription,
    description: item.description,
    stock: item.stock,
    brand: item.brand,
    characteristics:
      item.characteristics && typeof item.characteristics === "object"
        ? (item.characteristics as Record<string, string>)
        : {},
    isPopular: Boolean(item.isPopular),
    createdAt: item.createdAt.toISOString(),
  };
}

/**
 * Fetches popular products marked by the administrator (isPopular: true, in stock, not deleted).
 */
export async function getPopularProducts(limit: number = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isPopular: true,
      stock: { gt: 0 },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return products.map(serializeProduct);
}

export interface GetPublicProductsOptions {
  categorySlug?: string | null;
  inStockOnly?: boolean;
  limit?: number;
  search?: string;
}

/**
 * Fetches active (non-deleted) products from the database for the public catalog.
 */
export async function getPublicProducts(
  options: GetPublicProductsOptions = {}
): Promise<Product[]> {
  const { categorySlug, inStockOnly, limit, search } = options;

  const searchFilter = search?.trim()
    ? {
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" as const } },
          { brand: { contains: search.trim(), mode: "insensitive" as const } },
          { shortDescription: { contains: search.trim(), mode: "insensitive" as const } },
          { description: { contains: search.trim(), mode: "insensitive" as const } },
          { category: { name: { contains: search.trim(), mode: "insensitive" as const } } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(inStockOnly ? { stock: { gt: 0 } } : {}),
      ...searchFilter,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(limit ? { take: limit } : {}),
  });

  return products.map(serializeProduct);
}

/**
 * Fetches a single active product by slug for the product detail page.
 * Returns null if the product does not exist or has been soft-deleted.
 */
export async function getPublicProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) return null;

  return serializeProduct(product);
}
