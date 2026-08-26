import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getAdminOrders } from "@/actions/order-actions";
import { AdminOrdersClient } from "./admin-orders-client";

export const metadata: Metadata = {
  title: "Панель администратора: Заказы — TechGear",
  description: "Управление заказами и смена статусов в магазине TechGear.",
};

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const res = await getAdminOrders();
  const orders = res.success ? res.data : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Навигация и заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#06B6D4] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>В панель управления</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#06B6D4] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Управление заказами
            </h1>
          </div>
        </div>
      </div>

      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}
