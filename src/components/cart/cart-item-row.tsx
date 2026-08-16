/* eslint-disable @next/next/no-img-element */
"use client";

import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { useCart } from "@/hooks/use-cart";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);

  const maxStock = item.stock ?? 999;
  const lineTotal = item.price * item.quantity;

  const handleIncrement = () => {
    if (item.quantity < maxStock) {
      updateQuantity(item.productId, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    } else {
      removeItem(item.productId);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-slate-100 last:border-0 group">
      {/* 1. Миниатюра изображения (64x64) */}
      <div className="w-16 h-16 shrink-0 bg-[#F8FAFC] border border-slate-200 rounded-xl p-1.5 flex items-center justify-center overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* 2. Название, цена и селектор */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
            {item.name}
          </h4>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
            aria-label={`Удалить ${item.name} из корзины`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Селектор количества - / + */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Уменьшить количество"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-mono font-bold text-xs text-slate-900 select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={item.quantity >= maxStock}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Увеличить количество"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Итоговая цена за позицию */}
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 font-mono">
              {lineTotal.toLocaleString("ru-RU")} ₽
            </div>
            {item.quantity > 1 && (
              <div className="text-[10px] text-slate-400 font-mono">
                {item.price.toLocaleString("ru-RU")} ₽/шт.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
