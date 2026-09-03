import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";
import prisma from "@/lib/prisma";
import { getPublicProducts } from "@/lib/products";
import { getServerLocale } from "@/i18n/server";
import { createTranslator, getLocalizedCategory, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";
import { CategoryTranslations } from "@/types/product";
import { getI18nAlternates, getOgLocale } from "@/lib/seo";

interface CategoryPageProps {
  params: Promise<{
    locale?: string;
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
  const { locale: rawLocale, category } = await params;
  const { search } = await searchParams;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  const categoryObject = await prisma.category.findUnique({
    where: { slug: category },
  });

  if (!categoryObject) {
    return {
      title: t("seo.categoryNotFoundTitle"),
      robots: { index: false, follow: false },
    };
  }

  const localizedCat = getLocalizedCategory(
    {
      ...categoryObject,
      translations: categoryObject.translations as CategoryTranslations | null,
    },
    locale
  );

  const alternates = getI18nAlternates({
    path: `/catalog/${category}`,
    locale,
    includeXDefault: false,
  });

  if (search?.trim()) {
    const trimmed = search.trim();
    const title = t("seo.catalogSearchTitle", { query: trimmed });
    const description = t("seo.catalogSearchDescription", { query: trimmed });

    return {
      title,
      description,
      alternates,
      robots: { index: false, follow: true },
      openGraph: {
        title,
        description,
        url: alternates.canonical,
        siteName: "TechGear",
        locale: getOgLocale(locale),
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  const title = t("seo.categoryTitle", { category: localizedCat.name });
  const description = t("seo.categoryDescription", {
    category: localizedCat.name.toLowerCase(),
  });

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
