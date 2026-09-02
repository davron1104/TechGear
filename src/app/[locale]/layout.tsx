import { notFound } from "next/navigation";
import { isValidLocale, LOCALES, Locale } from "@/i18n";
import { LanguageProvider } from "@/context/language-context";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <LanguageProvider initialLocale={locale as Locale}>
      {children}
    </LanguageProvider>
  );
}
