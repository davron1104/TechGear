"use client";

import { useState } from "react";
import { Package, User as UserIcon } from "lucide-react";
import { Order } from "@/types/order";
import { OrdersHistoryTable } from "@/components/account/orders-history-table";
import { ProfileForm } from "@/components/account/profile-form";
import { useTranslation } from "@/context/language-context";

interface AccountClientViewProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  orders: Order[];
}

export function AccountClientView({ user, orders }: AccountClientViewProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const { t } = useTranslation();

  return (
    <div className="w-full pb-16 space-y-8">
      {/* Шапка личного кабинета */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("account.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("account.greeting", { name: user.name || "Customer" })}
          </p>
        </div>

        {/* Переключатель вкладок */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t("account.myOrders")}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{t("account.profile")}</span>
          </button>
        </div>
      </div>

      {/* Содержимое активной вкладки */}
      <div>
        {activeTab === "orders" ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-slate-900">
              {t("account.ordersHistory")} ({orders.length})
            </h2>
            <OrdersHistoryTable orders={orders} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <ProfileForm />
          </div>
        )}
      </div>
    </div>
  );
}
