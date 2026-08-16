"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, MapPin, Building, Home, MessageSquare, Truck, Store, ArrowRight, Loader2 } from "lucide-react";
import { checkoutSchema, CheckoutInput } from "@/lib/validations/checkout";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutInput) => Promise<void> | void;
  isLoading: boolean;
}

export function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      deliveryMethod: "courier",
      city: "Москва",
      street: "",
      house: "",
      apartment: "",
      comment: "",
    },
  });

  const deliveryMethod = useWatch({
    control,
    name: "deliveryMethod",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* 1. Контактная информация */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-[#06B6D4]" />
          <h3 className="text-base font-bold text-slate-900">
            1. Контактные данные
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Имя */}
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Имя и фамилия получателя *
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                placeholder="Иван Иванов"
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
        </div>
      </div>

      {/* 2. Способ доставки */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Truck className="w-5 h-5 text-[#06B6D4]" />
          <h3 className="text-base font-bold text-slate-900">
            2. Способ доставки
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              deliveryMethod === "courier"
                ? "border-[#06B6D4] bg-cyan-50/40 ring-1 ring-[#06B6D4]"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              value="courier"
              {...register("deliveryMethod")}
              className="mt-1 text-[#06B6D4] focus:ring-[#06B6D4]"
            />
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                <Truck className="w-4 h-4 text-[#06B6D4]" />
                <span>Курьерская доставка</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Доставка до двери курьером в течение 1–2 дней
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              deliveryMethod === "pickup"
                ? "border-[#06B6D4] bg-cyan-50/40 ring-1 ring-[#06B6D4]"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              value="pickup"
              {...register("deliveryMethod")}
              className="mt-1 text-[#06B6D4] focus:ring-[#06B6D4]"
            />
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                <Store className="w-4 h-4 text-[#06B6D4]" />
                <span>Самовывоз из магазина</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Бесплатно из флагманского магазина TechGear
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Адрес доставки */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-[#06B6D4]" />
          <h3 className="text-base font-bold text-slate-900">
            3. Адрес {deliveryMethod === "pickup" ? "пункта выдачи" : "доставки"}
          </h3>
        </div>

        {deliveryMethod === "pickup" ? (
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              Флагманский пункт выдачи TechGear:
            </p>
            <p>г. Москва, ул. Тверская, д. 12, стр. 1</p>
            <p className="text-slate-500">Время работы: ежедневно с 09:00 до 21:00</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            {/* Город */}
            <div className="sm:col-span-6">
              <label
                htmlFor="city"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Город *
              </label>
              <div className="relative">
                <input
                  id="city"
                  type="text"
                  placeholder="Москва"
                  {...register("city")}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                    errors.city ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
                  }`}
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.city && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.city.message}</p>
              )}
            </div>

            {/* Улица */}
            <div className="sm:col-span-3">
              <label
                htmlFor="street"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Улица *
              </label>
              <input
                id="street"
                type="text"
                placeholder="ул. Ленина"
                {...register("street")}
                className={`w-full px-4 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                  errors.street ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
                }`}
              />
              {errors.street && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.street.message}</p>
              )}
            </div>

            {/* Дом */}
            <div className="sm:col-span-1">
              <label
                htmlFor="house"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Дом *
              </label>
              <input
                id="house"
                type="text"
                placeholder="10"
                {...register("house")}
                className={`w-full px-3 py-2.5 bg-[#F8FAFC] border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all ${
                  errors.house ? "border-rose-400 focus:ring-rose-400" : "border-slate-200"
                }`}
              />
              {errors.house && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.house.message}</p>
              )}
            </div>

            {/* Квартира */}
            <div className="sm:col-span-2">
              <label
                htmlFor="apartment"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Квартира / Офис
              </label>
              <div className="relative">
                <input
                  id="apartment"
                  type="text"
                  placeholder="кв. 42"
                  {...register("apartment")}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all"
                />
                <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Комментарий */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MessageSquare className="w-5 h-5 text-[#06B6D4]" />
          <h3 className="text-base font-bold text-slate-900">
            4. Комментарий к заказу (опционально)
          </h3>
        </div>

        <div>
          <textarea
            id="comment"
            rows={3}
            placeholder="Укажите код домофона или удобное время доставки..."
            {...register("comment")}
            className="w-full p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] transition-all resize-none"
          />
          {errors.comment && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.comment.message}</p>
          )}
        </div>
      </div>

      {/* 5. Кнопка подтверждения заказа */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Оформление заказа...</span>
          </>
        ) : (
          <>
            <span>Подтвердить заказ</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
