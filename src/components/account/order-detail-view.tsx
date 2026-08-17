/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/order";
import { OrderStatusBadge } from "./order-status-badge";
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  Truck,
  MapPin,
  MessageSquare,
  AlertTriangle,
  XCircle,
  Package,
} from "lucide-react";

interface OrderDetailViewProps {
  order: Order;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelledMessage, setCancelledMessage] = useState<string | null>(null);

  const handleCancelOrder = () => {
    setStatus("CANCELLED");
    setIsCancelModalOpen(false);
    setCancelledMessage("Заказ успешно отменен.");
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Навигация назад */}
      <div>
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#06B6D4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад в личный кабинет</span>
        </Link>
      </div>

      {cancelledMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{cancelledMessage}</span>
        </div>
      )}

      {/* 1. Шапка заказа */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
              #{order.orderNumber}
            </h1>
            <OrderStatusBadge status={status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Оформлен: {formattedDate}</span>
          </div>
        </div>

        {/* Кнопка отмены заказа (только для NEW) */}
        {status === "NEW" && (
          <div>
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50/50 hover:bg-rose-100/80 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Отменить заказ</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Данные покупателя и доставки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Контактные данные */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#06B6D4]" />
            Получатель
          </h3>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 w-16">Имя:</span>
              <span className="font-semibold text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.email}</span>
            </div>
          </div>
        </div>

        {/* Доставка */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#06B6D4]" />
            Доставка
          </h3>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 w-16">Способ:</span>
              <span className="font-semibold text-slate-900">
                {order.deliveryMethod === "courier"
                  ? "Курьерская доставка"
                  : "Самовывоз из магазина"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                г. {order.city}
                {order.address ? `, ${order.address}` : ""}
              </span>
            </div>
            {order.comment && (
              <div className="flex items-start gap-2 pt-1 text-slate-500 italic">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>«{order.comment}»</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Состав заказа */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#06B6D4]" />
          Товары в заказе ({order.items.reduce((acc, i) => acc + i.quantity, 0)} шт.)
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
              <div className="w-16 h-16 shrink-0 bg-[#F8FAFC] border border-slate-200 rounded-xl p-1.5 flex items-center justify-center overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                  {item.name}
                </h4>
                <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                  {item.quantity} шт. × {item.price.toLocaleString("ru-RU")} ₽
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 font-mono shrink-0">
                {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
              </div>
            </div>
          ))}
        </div>

        {/* Сводка сумм */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Стоимость товаров:</span>
            <span className="font-mono font-semibold text-slate-900">
              {order.totalPrice.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Доставка:</span>
            <span>
              {order.deliveryCost === 0 ? (
                <span className="text-emerald-600 font-semibold">Бесплатно</span>
              ) : (
                <span className="font-mono font-semibold text-slate-900">
                  {order.deliveryCost} ₽
                </span>
              )}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Итого к оплате:
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
              {order.finalTotal.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения отмены */}
      {isCancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">
                Отменить заказ #{order.orderNumber}?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Вы уверены, что хотите отменить этот заказ? Это действие нельзя будет отменить.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                Оставить заказ
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Да, отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
