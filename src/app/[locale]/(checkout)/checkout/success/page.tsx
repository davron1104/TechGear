"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, PackageCheck, ArrowRight, Mail, Phone, MapPin, Truck, User } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { useTranslation } from "@/context/language-context";

function SuccessContent() {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("orderNumber") || "TG-84920";
  const name = searchParams.get("name") || "Customer";
  const email = searchParams.get("email") || "client@example.com";
  const phone = searchParams.get("phone") || "+998 90 123-45-67";
  const city = searchParams.get("city") || t("checkout.cityPlaceholder");
  const address = searchParams.get("address");
  const deliveryMethod = searchParams.get("deliveryMethod") || "courier";
  const total = searchParams.get("total") ? Number(searchParams.get("total")) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto py-8 sm:py-12">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-8 animate-in fade-in zoom-in duration-300">
        {/* Иконка успеха */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Заголовок */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t("checkout.orderAccepted")}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("checkout.thankYou")}
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t("checkout.orderSuccessMessage", { number: orderNumber })}
          </p>
        </div>

        {/* Сводка деталей доставки */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 text-left space-y-3.5 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#06B6D4]" />
              {t("checkout.orderDetailsTitle")}
            </span>
            <span className="font-mono font-bold text-base text-slate-900">
              {total > 0 ? formatPrice(total) : t("checkout.paymentOnReceiptShort")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Truck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {deliveryMethod === "courier"
                  ? t("checkout.courierDelivery")
                  : t("checkout.pickupDelivery")}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {deliveryMethod === "courier"
                  ? `${city}${address ? `, ${address}` : ""}`
                  : t("checkout.flagshipStoreAddress")}
              </span>
            </div>
          </div>
        </div>

        {/* Информационная подсказка */}
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          {t("checkout.confirmationNotice")}
        </p>

        {/* Кнопка возврата в каталог */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold shadow-md transition-all hover:scale-[1.01]"
          >
            <span>{t("checkout.backToCatalog")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 text-center text-slate-400">
          {t("common.loading")}
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
