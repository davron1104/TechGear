import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getBaseUrl } from "@/lib/seo";
import { LOCALES } from "@/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Получаем активные категории и активные товары параллельно (O(1) обращений к БД)
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // 1. Главная страница (для всех 3 локалей)
  for (const locale of LOCALES) {
    entries.push({
      url: `${baseUrl}/${locale}`,
    });
  }

  // 2. Каталог товаров (для всех 3 локалей)
  for (const locale of LOCALES) {
    entries.push({
      url: `${baseUrl}/${locale}/catalog`,
    });
  }

  // 3. Информационные страницы: Доставка и Гарантия (для всех 3 локалей)
  for (const locale of LOCALES) {
    entries.push({
      url: `${baseUrl}/${locale}/delivery`,
    });
    entries.push({
      url: `${baseUrl}/${locale}/warranty`,
    });
  }

  // 3. Категории товаров (для всех 3 локалей)
  for (const category of categories) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/catalog/${category.slug}`,
        lastModified: category.updatedAt,
      });
    }
  }

  // 4. Карточки активных товаров (для всех 3 локалей)
  for (const product of products) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/product/${product.slug}`,
        lastModified: product.updatedAt,
      });
    }
  }

  return entries;
}
