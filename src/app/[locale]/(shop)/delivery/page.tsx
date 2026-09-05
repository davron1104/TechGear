import type { Metadata } from "next";
import { getShopSettings } from "@/lib/settings-server";
import { DeliveryView } from "@/components/shop/delivery-view";
import { createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";
import { getI18nAlternates, getOgLocale } from "@/lib/seo";

interface DeliveryPageProps {
  params?: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: DeliveryPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  const title = t("seo.deliveryTitle");
  const description = t("seo.deliveryDescription");
  const alternates = getI18nAlternates({ path: "/delivery", locale, includeXDefault: false });

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

export default async function DeliveryPage() {
  const shopSettings = await getShopSettings();

  return <DeliveryView shopSettings={shopSettings} />;
}
