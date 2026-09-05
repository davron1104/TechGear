import type { Metadata } from "next";
import { getShopSettings } from "@/lib/settings-server";
import { WarrantyView } from "@/components/shop/warranty-view";
import { createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";
import { getI18nAlternates, getOgLocale } from "@/lib/seo";

interface WarrantyPageProps {
  params?: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: WarrantyPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  const title = t("seo.warrantyTitle");
  const description = t("seo.warrantyDescription");
  const alternates = getI18nAlternates({ path: "/warranty", locale, includeXDefault: false });

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

export default async function WarrantyPage() {
  const shopSettings = await getShopSettings();

  return <WarrantyView shopSettings={shopSettings} />;
}
