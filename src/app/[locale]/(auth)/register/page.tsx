import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";

interface RegisterPageProps {
  params?: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RegisterPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  return {
    title: t("seo.registerTitle"),
    description: t("seo.registerDescription"),
  };
}

export default function RegisterPage() {
  return (
    <div className="w-full py-8 sm:py-12 flex items-center justify-center">
      <RegisterForm />
    </div>
  );
}
