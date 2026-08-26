"use client";

import { useState, useTransition } from "react";
import { Order, OrderStatus } from "@/types/order";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { updateOrderStatus } from "@/actions/order-actions";
import {
  Package,
  Calendar,
  User,
  Phone,
  Mail,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  PackageCheck,
  AlertTriangle,
  Loader2,
  Search,
  RefreshCw,
} from "lucide-react";

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const [activeAction, setActiveAction] = useState<{
    orderId: string;
    orderNumber: string;
    nextStatus: OrderStatus;
    title: string;
    description: string;
    confirmButtonText: string;
    confirmButtonClass: string;
  } | null>(null);

  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  // Фильтрация
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === "ALL" || order.status === selectedStatus;

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.phone.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  const handleStatusTransition = (order: Order, nextStatus: OrderStatus) => {
    setServerError(null);
    setServerSuccess(null);

    if (order.status === "NEW" && nextStatus === "CONFIRMED") {
      setActiveAction({
        orderId: order.id,
        orderNumber: order.orderNumber,
        nextStatus: "CONFIRMED",
        title: `Подтвердить заказ #${order.orderNumber}?`,
        description:
          "При подтверждении заказа остатки товаров будут автоматически и атомарно списаны со склада.",
        confirmButtonText: "Подтвердить и списать остатки",
        confirmButtonClass: "bg-cyan-600 hover:bg-cyan-700 text-white",
      });
    } else if (order.status === "NEW" && nextStatus === "CANCELLED") {
      setActiveAction({
        orderId: order.id,
        orderNumber: order.orderNumber,
        nextStatus: "CANCELLED",
        title: `Отменить новый заказ #${order.orderNumber}?`,
        description:
          "Заказ будет переведен в статус «Отменен». Остатки на складе не изменяются.",
        confirmButtonText: "Да, отменить заказ",
        confirmButtonClass: "bg-rose-600 hover:bg-rose-700 text-white",
      });
    } else if (order.status === "CONFIRMED" && nextStatus === "COMPLETED") {
      setActiveAction({
        orderId: order.id,
        orderNumber: order.orderNumber,
        nextStatus: "COMPLETED",
        title: `Завершить заказ #${order.orderNumber}?`,
        description:
          "Заказ будет помечен как успешно выполненный и закрыт для дальнейших изменений.",
        confirmButtonText: "Выполнить заказ",
        confirmButtonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      });
    } else if (order.status === "CONFIRMED" && nextStatus === "CANCELLED") {
      setActiveAction({
        orderId: order.id,
        orderNumber: order.orderNumber,
        nextStatus: "CANCELLED",
        title: `Отменить подтвержденный заказ #${order.orderNumber}?`,
        description:
          "Внимание! При отмене ранее подтвержденного заказа все списанные товары будут автоматически возвращены на склад.",
        confirmButtonText: "Отменить и вернуть остатки",
        confirmButtonClass: "bg-rose-600 hover:bg-rose-700 text-white",
      });
    }
  };

  const confirmAction = () => {
    if (!activeAction) return;

    startTransition(async () => {
      const res = await updateOrderStatus(
        activeAction.orderId,
        activeAction.nextStatus
      );

      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === activeAction.orderId
              ? { ...o, status: activeAction.nextStatus }
              : o
          )
        );
        setServerSuccess(
          `Статус заказа #${activeAction.orderNumber} успешно изменен на ${activeAction.nextStatus}.`
        );
        setActiveAction(null);
      } else {
        setServerError(res.error);
        setActiveAction(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Баннеры уведомлений */}
      {serverSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{serverSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Панель фильтров и поиска */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Статусные табы */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { id: "ALL", label: "Все заказы", count: orders.length },
              {
                id: "NEW",
                label: "Новые",
                count: orders.filter((o) => o.status === "NEW").length,
              },
              {
                id: "CONFIRMED",
                label: "Подтвержденные",
                count: orders.filter((o) => o.status === "CONFIRMED").length,
              },
              {
                id: "COMPLETED",
                label: "Выполненные",
                count: orders.filter((o) => o.status === "COMPLETED").length,
              },
              {
                id: "CANCELLED",
                label: "Отмененные",
                count: orders.filter((o) => o.status === "CANCELLED").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Поиск */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по номеру, имени, email..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Список заказов */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <Package className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Заказы не найдены</p>
          <p className="text-xs text-slate-400">
            По выбранным фильтрам нет подходящих заказов.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString(
              "ru-RU",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 transition-all hover:border-slate-300"
              >
                {/* Верхняя панель карточки заказа */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Сумма заказа:</span>
                    <span className="font-mono font-extrabold text-base text-slate-900">
                      {order.finalTotal.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>

                {/* Данные покупателя и доставка */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#06B6D4]" />
                      Покупатель
                    </div>
                    <div>{order.customerName}</div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3 h-3" />
                      {order.phone}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Mail className="w-3 h-3" />
                      {order.email}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#06B6D4]" />
                      Доставка
                    </div>
                    <div>
                      {order.deliveryMethod === "courier"
                        ? "Курьерская доставка"
                        : "Самовывоз"}
                    </div>
                    <div className="flex items-start gap-1 text-slate-500">
                      <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>
                        г. {order.city}
                        {order.address ? `, ${order.address}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#06B6D4]" />
                      Состав ({order.items.reduce((s, i) => s + i.quantity, 0)} шт.)
                    </div>
                    <div className="max-h-20 overflow-y-auto space-y-1 pr-1">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <span className="truncate max-w-[150px]">
                            {item.name}
                          </span>
                          <span className="font-mono text-slate-400 shrink-0">
                            {item.quantity} шт. × {item.price} ₽
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Управление статусом заказа */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    {order.status === "COMPLETED" && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Заказ успешно выполнен и закрыт
                      </span>
                    )}
                    {order.status === "CANCELLED" && (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Заказ отменен (архив)
                      </span>
                    )}
                  </div>

                  {/* Кнопки действий по State Machine */}
                  <div className="flex items-center gap-2">
                    {order.status === "NEW" && (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStatusTransition(order, "CANCELLED")}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Отменить</span>
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStatusTransition(order, "CONFIRMED")}
                          className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Подтвердить (списать склад)</span>
                        </button>
                      </>
                    )}

                    {order.status === "CONFIRMED" && (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStatusTransition(order, "CANCELLED")}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Отменить (вернуть склад)</span>
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStatusTransition(order, "COMPLETED")}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Выполнить заказ</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно подтверждения действия */}
      {activeAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {activeAction.title}
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeAction.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setActiveAction(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Отмена
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={confirmAction}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer ${activeAction.confirmButtonClass}`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Выполняется...</span>
                  </>
                ) : (
                  <span>{activeAction.confirmButtonText}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
