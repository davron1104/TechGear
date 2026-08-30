import Link from "next/link";
import { Order } from "@/types/order";
import { OrderStatusBadge } from "./order-status-badge";
import { Package, Calendar, ChevronRight, ShoppingBag } from "lucide-react";
import { formatCurrency, CurrencyType } from "@/lib/currency";

interface OrdersHistoryTableProps {
  orders: Order[];
}

export function OrdersHistoryTable({ orders }: OrdersHistoryTableProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">У вас пока нет заказов</h3>
        <p className="text-xs text-slate-500">
          После оформления первого заказа вы сможете отслеживать его статус и историю здесь.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-xs font-bold transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Десктопная таблица / Карточки заказов */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={order.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              {/* Информация о заказе */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base text-slate-900">
                    #{order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} тов.
                    </span>
                  </div>
                </div>
              </div>

              {/* Сумма и ссылка */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                    Сумма заказа
                  </span>
                  <span className="font-mono font-extrabold text-base text-slate-900">
                    {formatCurrency(
                      order.finalTotal,
                      (order.currency as CurrencyType) || "UZS",
                      order.exchangeRate || 12500
                    )}
                  </span>
                </div>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#06B6D4] hover:text-white text-slate-800 text-xs font-semibold transition-all group"
                >
                  <span>Детали</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
