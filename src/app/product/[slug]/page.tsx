import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { ProductSpecs } from "@/components/product/product-specs";
import { ProductStickyBar } from "@/components/product/product-sticky-bar";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Товар не найден — TechGear",
    };
  }

  return {
    title: `${product.name} — TechGear`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="w-full pb-20 lg:pb-12">
      {/* Основной двухколоночный блок товара */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Левая колонка: Галерея / Крупное фото */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <ProductGallery product={product} />
        </div>

        {/* Правая колонка: Блок покупки и описания */}
        <div className="lg:col-span-6">
          <ProductBuyBox product={product} />
        </div>
      </div>

      {/* Секция подробного описания и характеристик */}
      <ProductSpecs product={product} />

      {/* Мобильная закрепленная полоса покупки */}
      <ProductStickyBar product={product} />
    </div>
  );
}
