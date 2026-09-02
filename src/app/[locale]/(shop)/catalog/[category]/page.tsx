import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";
import prisma from "@/lib/prisma";
import { getPublicProducts } from "@/lib/products";
import { getServerLocale } from "@/i18n/server";
import { getLocalizedCategory } from "@/i18n";
import { CategoryTranslations } from "@/types/product";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const { search } = await searchParams;
  const categoryObject = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!categoryObject) {
    return {
      title: "Категория не найдена — TechGear",
    };
  }

  if (search?.trim()) {
    return {
      title: `Поиск: ${search.trim()} в ${categoryObject.name} — TechGear`,
      description: `Результаты поиска по запросу "${search.trim()}" в категории ${categoryObject.name} интернет-магазина TechGear.`,
    };
  }

  return {
    title: `${categoryObject.name} — купить в TechGear`,
    description: `Качественные ${categoryObject.name.toLowerCase()} по лучшим ценам с гарантией и быстрой доставкой в интернет-магазине TechGear.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { search } = await searchParams;
  const categoryObject = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!categoryObject) {
    notFound();
  }

  const locale = await getServerLocale();
  const localizedCat = getLocalizedCategory(
    {
      ...categoryObject,
      translations: categoryObject.translations as CategoryTranslations | null,
    },
    locale
  );

  const products = await getPublicProducts({
    categorySlug: category,
    search,
  });

  return (
    <div className="w-full pb-12">
      <Suspense
        fallback={
          <div className="w-full py-20 text-center text-slate-400">
            Загрузка каталога категории...
          </div>
        }
      >
        <CatalogView
          products={products}
          categorySlug={category}
          categoryName={localizedCat.name}
          search={search}
        />
      </Suspense>
    </div>
  );
}
