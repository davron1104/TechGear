"use client";

import React, { useState, useTransition } from "react";
import { ShopSettings } from "@/lib/settings";
import { updateShopSettings } from "@/actions/settings-actions";
import { useCurrency } from "@/context/currency-context";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ShopSettingsFormProps {
  initialSettings: ShopSettings;
}

export function ShopSettingsForm({ initialSettings }: ShopSettingsFormProps) {
  const { formatPrice } = useCurrency();

  const [formData, setFormData] = useState<ShopSettings>(initialSettings);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "deliveryCostUzs" || name === "freeDeliveryThresholdUzs"
          ? parseInt(value, 10) || 0
          : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (serverError) setServerError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateShopSettings(formData);
      if (res.success) {
        setFormData(res.data);
        setSuccessMessage("Настройки магазина успешно сохранены и применены на витрине.");
      } else {
        setServerError(res.error || "Не удалось сохранить настройки магазина.");
        if (res.fields) {
          setFieldErrors(res.fields);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-900">Успешно</h4>
            <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Ошибка сохранения</h4>
            <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* 1. Секция: Контакты магазина */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#06B6D4]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Контакты магазина</h3>
              <p className="text-xs text-slate-500">
                Отображаются в шапке (Header) и подвале (Footer) сайта
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Контакты
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Телефон */}
          <div>
            <label
              htmlFor="shop-phone"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Телефон магазина
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="shop-phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (800) 555-35-35"
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all ${
                  fieldErrors.phone ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.phone[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="shop-email"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Email службы поддержки
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="shop-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="support@techgear.uz"
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all ${
                  fieldErrors.email ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          {/* Адрес */}
          <div className="md:col-span-2">
            <label
              htmlFor="shop-address"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Адрес магазина / пункта самовывоза
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="shop-address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="г. Ташкент, ул. Амира Темура, д. 42"
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all ${
                  fieldErrors.address ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
                }`}
              />
            </div>
            {fieldErrors.address && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.address[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Секция: Режим работы */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Режим работы</h3>
              <p className="text-xs text-slate-500">График обработки заказов и работы поддержки</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            График
          </span>
        </div>

        <div className="p-6">
          <label
            htmlFor="shop-working-hours"
            className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
          >
            Часы работы магазина
          </label>
          <div className="relative max-w-md">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="shop-working-hours"
              name="workingHours"
              type="text"
              value={formData.workingHours}
              onChange={handleChange}
              placeholder="Пн–Вс: 09:00 – 21:00"
              className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all ${
                fieldErrors.workingHours
                  ? "border-rose-400 bg-rose-50/20"
                  : "border-slate-200"
              }`}
            />
          </div>
          {fieldErrors.workingHours && (
            <p className="text-xs text-rose-600 mt-1 font-medium">
              {fieldErrors.workingHours[0]}
            </p>
          )}
        </div>
      </div>

      {/* 3. Секция: Доставка */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Условия доставки</h3>
              <p className="text-xs text-slate-500">
                Базовые параметры в валюте UZS (автоматически пересчитываются в USD на витрине)
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Доставка
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Стоимость доставки */}
          <div>
            <label
              htmlFor="delivery-cost"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Стоимость курьерской доставки (UZS)
            </label>
            <div className="relative">
              <input
                id="delivery-cost"
                name="deliveryCostUzs"
                type="number"
                min="0"
                step="1000"
                value={formData.deliveryCostUzs}
                onChange={handleChange}
                placeholder="30000"
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all ${
                  fieldErrors.deliveryCostUzs
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                сум
              </span>
            </div>
            {fieldErrors.deliveryCostUzs && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.deliveryCostUzs[0]}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span>Текущее отображение:</span>
              <strong className="text-slate-700 font-mono">
                {formatPrice(formData.deliveryCostUzs)}
              </strong>
            </p>
          </div>

          {/* Порог бесплатной доставки */}
          <div>
            <label
              htmlFor="free-delivery-threshold"
              className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Порог бесплатной доставки (UZS)
            </label>
            <div className="relative">
              <input
                id="free-delivery-threshold"
                name="freeDeliveryThresholdUzs"
                type="number"
                min="0"
                step="10000"
                value={formData.freeDeliveryThresholdUzs}
                onChange={handleChange}
                placeholder="500000"
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#06B6D4] focus:bg-white transition-all ${
                  fieldErrors.freeDeliveryThresholdUzs
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-slate-200"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                сум
              </span>
            </div>
            {fieldErrors.freeDeliveryThresholdUzs && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {fieldErrors.freeDeliveryThresholdUzs[0]}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span>Текущее отображение:</span>
              <strong className="text-slate-700 font-mono">
                {formatPrice(formData.freeDeliveryThresholdUzs)}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Кнопка сохранения настроек */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="py-3 px-6 rounded-xl font-bold text-sm bg-[#06B6D4] hover:bg-[#0891B2] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Сохранение настроек...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Сохранить настройки магазина</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
