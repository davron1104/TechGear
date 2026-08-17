"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, Loader2, CheckCircle2, Save } from "lucide-react";
import { profileSchema, ProfileInput } from "@/lib/validations/profile";
import { mockUserProfile } from "@/data/mock-orders";

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: mockUserProfile.name,
      email: mockUserProfile.email,
      phone: mockUserProfile.phone,
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    setIsLoading(true);
    setSuccessMessage(null);

    // Имитация сохранения данных на клиенте
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Профиль обновлен: ${data.name}, ${data.email}`);
    }, 600);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs max-w-2xl">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center font-bold text-lg">
          {mockUserProfile.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Персональные данные
          </h2>
          <p className="text-xs text-slate-500">
            Управляйте своими контактными данными для быстрого оформления заказов
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Имя */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Имя и фамилия *
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              placeholder="Алексей Смирнов"
              {...register("name")}
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                errors.name ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
              }`}
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Электронная почта *
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                errors.email ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
              }`}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Телефон */}
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Номер телефона *
          </label>
          <div className="relative">
            <input
              id="phone"
              type="tel"
              placeholder="+7 (999) 000-00-00"
              {...register("phone")}
              className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                errors.phone ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
              }`}
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.phone && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Кнопка сохранения */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="py-3 px-6 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Сохранить изменения</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
