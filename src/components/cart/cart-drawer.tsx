"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { CartItemRow } from "./cart-item-row";

const emptySubscribe = () => () => {};

export function CartDrawer() {
  const { formatPrice } = useCurrency();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isOpen = useCart((state) => state.isOpen);
  const closeCart = useCart((state) => state.closeCart);
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const getTotalPrice = useCart((state) => state.getTotalPrice);
  const getTotalCount = useCart((state) => state.getTotalCount);

  const totalCount = isHydrated ? getTotalCount() : 0;
  const totalPrice = isHydrated ? getTotalPrice() : 0;

  // Блокировка скролла страницы и обработка клавиши Escape при открытой корзине
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* 1. Полупрозрачный оверлей с плавным затемнением и размытием */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* 2. Выдвижная боковая панель справа с плавной анимацией скольжения */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className={`w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Шапка корзины */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#06B6D4]" />
              <h2 className="text-lg font-bold text-slate-900">
                Корзина
                {totalCount > 0 && (
                  <span className="ml-2 text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {totalCount}
                  </span>
                )}
              </h2>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Закрыть корзину"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Содержимое корзины (список или пустое состояние) */}
          <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Ваша корзина пуста
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Выберите девайсы и аксессуары в каталоге, чтобы оформить заказ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Перейти к покупкам
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <CartItemRow key={item.productId} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Подвал корзины (Sticky Footer) */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Строка с итоговой суммой */}
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-600">
                  Итого к оплате:
                </span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Кнопка оформления заказа */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 px-6 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Оформить заказ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Кнопка быстрой очистки корзины */}
              <button
                type="button"
                onClick={clearCart}
                className="w-full text-xs text-slate-400 hover:text-rose-600 flex items-center justify-center gap-1.5 transition-colors py-1 cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить корзину</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
