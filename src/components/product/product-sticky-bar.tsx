"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";

interface ProductStickyBarProps {
  product: Product;
  quantity: number;
}

export function ProductStickyBar({ product, quantity }: ProductStickyBarProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const quantityInCart = useCart(
    (state) =>
      state.items.find((item) => item.productId === product.id)?.quantity ?? 0
  );

  const availableStock = Math.max(0, product.stock - quantityInCart);
  const isPhysicallyInStock = product.stock > 0;
  const canAddToCart = availableStock > 0;

  const effectiveQty = canAddToCart
    ? Math.min(Math.max(1, quantity), availableStock)
    : 0;
  const displayQty = canAddToCart ? effectiveQty : 1;
  const totalPrice = product.price * displayQty;

  const handleAddToCart = () => {
    if (!canAddToCart || effectiveQty <= 0) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: effectiveQty,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 shadow-2xl safe-area-bottom">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Цена и статус */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-semibold text-slate-400 truncate">
            {product.name}
            {canAddToCart && effectiveQty > 1 && (
              <span className="text-[#06B6D4] ml-1">({effectiveQty} шт.)</span>
            )}
          </span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            {totalPrice.toLocaleString("ru-RU")} ₽
          </span>
        </div>

        {/* Кнопка действия */}
        {!isPhysicallyInStock ? (
          <button
            type="button"
            disabled
            className="py-3 px-5 rounded-xl font-medium text-xs bg-slate-100 text-slate-400 cursor-not-allowed shrink-0"
          >
            <span>Нет в наличии</span>
          </button>
        ) : availableStock === 0 ? (
          <button
            type="button"
            disabled
            className="py-3 px-5 rounded-xl font-medium text-xs bg-slate-100 text-slate-500 cursor-not-allowed shrink-0"
          >
            <span>В корзине (макс.)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 active:scale-95"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Добавлено ({effectiveQty})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>В корзину</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
