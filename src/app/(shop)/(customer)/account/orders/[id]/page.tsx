import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { mockOrders } from "@/data/mock-orders";
import { OrderDetailView } from "@/components/account/order-detail-view";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = mockOrders.find((o) => o.id === id || o.orderNumber === id);

  return {
    title: order ? `Заказ #${order.orderNumber} — TechGear` : "Заказ не найден — TechGear",
    description: "Просмотр деталей заказа в личном кабинете TechGear.",
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = mockOrders.find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    return (
      <div className="w-full max-w-md mx-auto py-16 text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4 my-8">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Заказ не найден</h1>
        <p className="text-xs text-slate-500">
          Заказ с идентификатором <strong className="text-slate-700 font-mono">#{id}</strong> не найден в вашей истории заказов.
        </p>
        <div className="pt-2">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться в личный кабинет</span>
          </Link>
        </div>
      </div>
    );
  }

  return <OrderDetailView order={order} />;
}
