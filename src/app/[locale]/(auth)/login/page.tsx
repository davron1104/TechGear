import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";
import { createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";

interface LoginPageProps {
  params?: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  return {
    title: t("seo.loginTitle"),
    description: t("seo.loginDescription"),
  };
}

export default function LoginPage() {
  return (
    <div className="w-full py-8 sm:py-12 flex items-center justify-center">
      <Suspense fallback={<div className="text-sm text-slate-500">Загрузка...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
