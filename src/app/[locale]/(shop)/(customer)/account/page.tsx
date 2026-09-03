import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserOrders } from "@/actions/order-actions";
import { AccountClientView } from "@/components/account/account-client-view";
import { getServerLocale } from "@/i18n/server";
import { getLocalizedHref, createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";

interface AccountPageProps {
  params?: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  return {
    title: t("seo.accountTitle"),
    description: t("seo.accountDescription"),
  };
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    const locale = await getServerLocale();
    redirect(getLocalizedHref("/login", locale));
  }

  const res = await getUserOrders();
  const orders = res.success ? res.data : [];

  return <AccountClientView user={session.user} orders={orders} />;
}
