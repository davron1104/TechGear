import { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";
import { getPublicProducts } from "@/lib/products";

interface CatalogPageProps {
  searchParams: Promise<{ search?: string }>;
}

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const { search } = await searchParams;
  if (search?.trim()) {
    return {
      title: `Поиск: ${search.trim()} — TechGear`,
      description: `Результаты поиска по запросу "${search.trim()}" в интернет-магазине TechGear.`,
    };
  }
  return {
    title: "Каталог товаров — TechGear",
    description: "Широкий выбор профессиональной компьютерной техники, периферии и аксессуаров в интернет-магазине TechGear.",
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { search } = await searchParams;
  const products = await getPublicProducts({ search });

  return (
    <div className="w-full pb-12">
      <Suspense
        fallback={
          <div className="w-full py-20 text-center text-slate-400">
            Загрузка каталога...
          </div>
        }
      >
        <CatalogView products={products} categorySlug={null} search={search} />
      </Suspense>
    </div>
  );
}
