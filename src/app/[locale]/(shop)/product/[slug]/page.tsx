import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { getPublicProductBySlug } from "@/lib/products";
import { createTranslator, getLocalizedProduct, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";
import { getI18nAlternates, getOgLocale } from "@/lib/seo";

interface ProductPageProps {
  params: Promise<{
    locale?: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: t("seo.productNotFoundTitle"),
      robots: { index: false, follow: false },
    };
  }

  const localizedProduct = getLocalizedProduct(product, locale);
  const title = `${localizedProduct.name} — TechGear`;
  const description =
    localizedProduct.shortDescription || localizedProduct.description || title;
  const alternates = getI18nAlternates({
    path: `/product/${slug}`,
    locale,
    includeXDefault: false,
  });
  const ogImages = product.image ? [product.image] : [];

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "TechGear",
      locale: getOgLocale(locale),
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
