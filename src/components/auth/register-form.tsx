"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/actions/auth-actions";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/language-context";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const result = await registerUser(data);

      if (!result.success) {
        setIsLoading(false);
        setStatusMessage(result.error || t("auth.registrationError"));
        if (result.fields) {
          Object.entries(result.fields).forEach(([field, messages]) => {
            setError(field as keyof RegisterInput, {
              type: "server",
              message: messages[0],
            });
          });
        }
        return;
      }

      // Auto-login after successful registration
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        setIsLoading(false);
        setStatusMessage(t("auth.autoLoginFailed"));
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        router.push("/");
        router.refresh();
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
          {t("auth.registerTitle")}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          {t("auth.registerSubtitle")}
        </p>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs leading-relaxed">
          {statusMessage}
        </div>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Поле Имя */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            {t("auth.nameLabel")}
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              placeholder={t("auth.namePlaceholder")}
              {...register("name")}
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                errors.name
                  ? "border-rose-400 focus:ring-rose-400"
                  : "border-slate-200"
              }`}
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-600 mt-1 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

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

        {/* Поле Пароль */}
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

        {/* Поле Подтверждение пароля */}
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

        {/* Кнопка регистрации */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("auth.creatingAccount")}</span>
            </>
          ) : (
            <>
              <span>{t("auth.registerButton")}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Переход к входу */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
        {t("auth.haveAccount")}{" "}
        <Link
          href="/login"
          className="text-[#06B6D4] hover:text-[#0891B2] font-semibold underline underline-offset-4 transition-colors"
        >
          {t("auth.loginLink")}
        </Link>
      </div>
    </div>
  );
}
