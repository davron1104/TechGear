"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  resetPasswordSchema,
  setNewPasswordSchema,
  ResetPasswordInput,
  SetNewPasswordInput,
} from "@/lib/validations/auth";
import { sendPasswordResetLink, resetPassword } from "@/actions/auth-actions";
import { useTranslation } from "@/context/language-context";
import { getLocalizedHref } from "@/i18n";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (token) {
    return <SetNewPasswordForm token={token} />;
  }

  return <RequestResetLinkForm />;
}

function RequestResetLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { t, locale } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await sendPasswordResetLink(data);
      setIsLoading(false);
      if (res.success) {
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
      } else {
        setStatusMessage(res.error || t("auth.registrationError"));
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMessage(t("auth.unexpectedError"));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Шапка формы */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {t("auth.resetTitle")}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          {t("auth.resetSubtitle")}
        </p>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
          {statusMessage}
        </div>
      )}

      {isSubmitted ? (
        <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">
              {t("auth.resetEmailSentTitle")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("auth.resetEmailSentText")}{" "}
              <strong className="text-slate-900 font-semibold">
                {submittedEmail}
              </strong>
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={getLocalizedHref("/login", locale)}
              className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("auth.backToLogin")}</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Поле Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t("auth.emailLabel")}
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                  errors.email
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-200"
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("auth.sendingResetLink")}</span>
              </>
            ) : (
              <>
                <span>{t("auth.getResetLink")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Ссылка возврата ко входу */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            {t("auth.rememberPassword")}{" "}
            <Link
              href={getLocalizedHref("/login", locale)}
              className="text-[#06B6D4] hover:text-[#0891B2] font-semibold underline underline-offset-4 transition-colors"
            >
              {t("auth.loginLink")}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

function SetNewPasswordForm({ token }: { token: string }) {
  const { t, locale } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SetNewPasswordInput>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SetNewPasswordInput) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await resetPassword(token, data);
      setIsLoading(false);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setStatusMessage(res.error || t("auth.registrationError"));
        if (res.fields) {
          Object.entries(res.fields).forEach(([field, messages]) => {
            setError(field as keyof SetNewPasswordInput, {
              type: "server",
              message: messages[0],
            });
          });
        }
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setStatusMessage(t("auth.unexpectedError"));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Шапка формы */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {t("auth.newPasswordTitle")}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          {t("auth.newPasswordSubtitle")}
        </p>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
          {statusMessage}
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">
              {t("auth.passwordChangedTitle")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("auth.passwordChangedText")}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={getLocalizedHref("/login", locale)}
              className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>{t("auth.loginButton")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Пароль */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t("auth.passwordLabel")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordPlaceholder")}
                {...register("password")}
                className={`w-full pl-10 pr-11 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                  errors.password
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-200"
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Подтверждение пароля */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t("auth.confirmPasswordLabel")}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("auth.confirmPasswordPlaceholder")}
                {...register("confirmPassword")}
                className={`w-full pl-10 pr-11 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                  errors.confirmPassword
                    ? "border-rose-400 focus:ring-rose-400"
                    : "border-slate-200"
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                aria-label={
                  showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("auth.savingNewPassword")}</span>
              </>
            ) : (
              <>
                <span>{t("auth.saveNewPassword")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Ссылка возврата ко входу */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            {t("auth.rememberPassword")}{" "}
            <Link
              href={getLocalizedHref("/login", locale)}
              className="text-[#06B6D4] hover:text-[#0891B2] font-semibold underline underline-offset-4 transition-colors"
            >
              {t("auth.loginLink")}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
