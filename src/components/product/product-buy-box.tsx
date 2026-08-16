"use client";

import { useState } from "react";
import { ShoppingCart, Check, Plus, Minus, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";

interface ProductBuyBoxProps {
  product: Product;
}

export function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(product.stock > 0 ? 1 : 0);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCart((state) => state.addItem);

  const isInStock = product.stock > 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!isInStock || quantity <= 0) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* 1. Категория и бренд */}
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span>{product.categoryName}</span>
        <span className="text-[#06B6D4]">{product.brand}</span>
      </div>

      {/* 2. Заголовок */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
        {product.name}
      </h1>

      {/* 3. Краткое описание */}
      <p className="text-sm text-slate-600 leading-relaxed">
        {product.shortDescription}
      </p>

      {/* 4. Блок цены */}
      <div className="pt-2 pb-1 border-y border-slate-100 flex items-baseline justify-between">
        <span className="text-xs text-slate-400 font-medium">Стоимость:</span>
        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
          {product.price.toLocaleString("ru-RU")} ₽
        </div>
      </div>

      {/* 5. Выбор количества и кнопка добавления */}
      <div className="space-y-4">
        {isInStock ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Количество:
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Доступно: {product.stock} шт.
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Селектор - / + */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Уменьшить количество"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-mono font-bold text-base text-slate-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Увеличить количество"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Главная кнопка добавления в корзину */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 animate-in zoom-in" />
                    <span>Добавлено ({quantity} шт.)</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Добавить в корзину</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Товар временно отсутствует</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Преимущества сервиса */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>Официальная гарантия 12 месяцев</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#06B6D4] shrink-0" />
          <span>Быстрая отправка в день заказа</span>
        </div>
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>14 дней на обмен или возврат без лишних вопросов</span>
        </div>
      </div>
    </div>
  );
}
