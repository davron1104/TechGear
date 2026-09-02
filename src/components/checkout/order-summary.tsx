/* eslint-disable @next/next/no-img-element */
"use client";

import { CartItem } from "@/types/cart";
import { ShieldCheck, Truck, CreditCard } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { useTranslation } from "@/context/language-context";
import { DEFAULT_SHOP_SETTINGS } from "@/lib/settings";

import { getLocalizedProductName } from "@/i18n";

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  deliveryCostUzs?: number;
  freeDeliveryThresholdUzs?: number;
}

export function OrderSummary({
  items,
  totalPrice,
  deliveryCostUzs = DEFAULT_SHOP_SETTINGS.deliveryCostUzs,
  freeDeliveryThresholdUzs = DEFAULT_SHOP_SETTINGS.freeDeliveryThresholdUzs,
}: OrderSummaryProps) {
  const { formatPrice } = useCurrency();
  const { t, locale } = useTranslation();
  const isFreeDelivery = totalPrice >= freeDeliveryThresholdUzs;
  const deliveryCost = isFreeDelivery ? 0 : deliveryCostUzs;
  const finalTotal = totalPrice + deliveryCost;

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
        {t("checkout.orderTitle", { count: items.reduce((acc, i) => acc + i.quantity, 0) })}
      </h2>

      {/* 1. Список товаров */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
        {items.map((item) => {
          const localizedName = getLocalizedProductName(item, locale);

          return (
            <div key={item.productId} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
              <div className="w-12 h-12 shrink-0 bg-[#F8FAFC] border border-slate-200 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                <img
                  src={item.image}
                  alt={localizedName}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-900 truncate">
                  {localizedName}
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.quantity} × {formatPrice(item.price)}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono shrink-0">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Расчет стоимости */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>{t("checkout.productsCost")}</span>
          <span className="font-mono font-semibold text-slate-900">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>{t("checkout.deliveryCostLabel")}</span>
          </div>
          {isFreeDelivery ? (
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {t("checkout.freeDelivery")}
            </span>
          ) : (
            <span className="font-mono font-semibold text-slate-900">
              {formatPrice(deliveryCostUzs)}
            </span>
          )}
        </div>

        {!isFreeDelivery && (
          <p className="text-[11px] text-slate-400 leading-tight">
            {t("checkout.freeDeliveryRemaining", {
              amount: formatPrice(freeDeliveryThresholdUzs - totalPrice),
            })}
          </p>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t("checkout.totalPayable")}
          </span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* 3. Гарантии сервиса */}
      <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
          <span>{t("checkout.paymentOnReceipt")}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          <span>{t("checkout.guaranteeCheck")}</span>
        </div>
      </div>
    </aside>
  );
}
