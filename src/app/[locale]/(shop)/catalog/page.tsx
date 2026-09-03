import { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";
import { getPublicProducts } from "@/lib/products";
import { createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";
import { getI18nAlternates, getOgLocale } from "@/lib/seo";

interface CatalogPageProps {
  params?: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);
  const { search } = await searchParams;

  const alternates = getI18nAlternates({ path: "/catalog", locale, includeXDefault: false });

  if (search?.trim()) {
    const trimmed = search.trim();
    const title = t("seo.catalogSearchTitle", { query: trimmed });
    const description = t("seo.catalogSearchDescription", { query: trimmed });

    return {
      title,
      description,
      alternates,
      robots: {
        index: false,
        follow: true,
      },
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

  const title = t("seo.catalogTitle");
  const description = t("seo.catalogDescription");

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
