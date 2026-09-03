import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";
import { createTranslator, Locale, DEFAULT_LOCALE, isValidLocale } from "@/i18n";

interface ResetPasswordPageProps {
  params?: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ResetPasswordPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const rawLocale = resolvedParams?.locale;
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = createTranslator(locale);

  return {
    title: t("seo.resetPasswordTitle"),
    description: t("seo.resetPasswordDescription"),
  };
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full py-8 sm:py-12 flex items-center justify-center">
      <Suspense fallback={<div className="text-sm text-slate-500">Загрузка...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
