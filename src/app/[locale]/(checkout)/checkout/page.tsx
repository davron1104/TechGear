import { Metadata } from "next";
import { getShopSettings } from "@/lib/settings-server";
import { CheckoutClientView } from "@/components/checkout/checkout-client-view";
import { createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";

interface CheckoutPageProps {
  params?: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  return {
    title: t("seo.checkoutTitle"),
    description: t("seo.checkoutDescription"),
  };
}

export default async function CheckoutPage() {
  const shopSettings = await getShopSettings();

  return <CheckoutClientView shopSettings={shopSettings} />;
}
