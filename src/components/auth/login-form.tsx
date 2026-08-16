"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { loginSchema, LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setStatusMessage(null);

    // Имитация клиентской обработки для frontend-этапа
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage(
        `Форма валидна! Email: ${data.email}. (Серверная авторизация будет подключена на этапе бэкенда).`
      );
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Шапка формы */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Вход в аккаунт
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Войдите, чтобы отслеживать заказы и управлять профилем
        </p>
      </div>

      {statusMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs leading-relaxed">
          {statusMessage}
        </div>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Поле Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Электронная почта
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
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Пароль
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
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

        {/* Кнопка входа */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Проверка данных...</span>
            </>
          ) : (
            <>
              <span>Войти</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Переход к регистрации */}
      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
        Нет учетной записи?{" "}
        <Link
          href="/register"
          className="text-[#06B6D4] hover:text-[#0891B2] font-semibold underline underline-offset-4 transition-colors"
        >
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}
