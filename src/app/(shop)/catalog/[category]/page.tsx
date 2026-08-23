import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";
import prisma from "@/lib/prisma";
import { getPublicProducts } from "@/lib/products";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryObject = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!categoryObject) {
    return {
      title: "Категория не найдена — TechGear",
    };
  }

  return {
    title: `${categoryObject.name} — купить в TechGear`,
    description: `Качественные ${categoryObject.name.toLowerCase()} по лучшим ценам с гарантией и быстрой доставкой в интернет-магазине TechGear.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryObject = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!categoryObject) {
    notFound();
  }

  const products = await getPublicProducts({ categorySlug: category });

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
          categoryName={categoryObject.name}
        />
      </Suspense>
    </div>
  );
}
