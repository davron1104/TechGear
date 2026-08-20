"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutInput } from "@/lib/validations/checkout";

const emptySubscribe = () => () => {};

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const items = useCart((state) => state.items);
  const getTotalPrice = useCart((state) => state.getTotalPrice);
  const clearCart = useCart((state) => state.clearCart);

  const totalPrice = isHydrated ? getTotalPrice() : 0;
  const isFreeDelivery = totalPrice >= 5000;
  const deliveryCost = isFreeDelivery ? 0 : 490;
  const finalTotal = totalPrice + deliveryCost;

  const handleCheckoutSubmit = async (data: CheckoutInput) => {
    setIsLoading(true);

    // Имитация создания заказа на frontend-этапе
    setTimeout(() => {
      const orderNumber = `TG-${Math.floor(10000 + Math.random() * 90000)}`;

      // Очистка локальной корзины
      clearCart();

      // Переход на экран подтверждения
      const params = new URLSearchParams({
        orderNumber,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        deliveryMethod: data.deliveryMethod,
        total: String(finalTotal),
      });

      if (data.street && data.house) {
        params.set("address", `ул. ${data.street}, д. ${data.house}${data.apartment ? `, кв. ${data.apartment}` : ""}`);
      }

      router.push(`/checkout/success?${params.toString()}`);
    }, 800);
  };

  if (!isHydrated) {
    return (
      <div className="w-full py-20 text-center text-slate-400">
        Загрузка оформления заказа...
      </div>
    );
  }

  // Пустая корзина
  if (items.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto my-8 space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Ваша корзина пуста
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Для оформления заказа добавьте девайсы или аксессуары из нашего каталога.
        </p>
        <div className="pt-2">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-sm font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Перейти в каталог</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Заголовок страницы */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Оформление заказа
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Заполните данные получателя и выберите удобный способ доставки
        </p>
      </div>

      {/* Двухколоночный макет: Слева форма, Справа Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <CheckoutForm onSubmit={handleCheckoutSubmit} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-5">
          <OrderSummary items={items} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}
