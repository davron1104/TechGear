/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCart((state) => state.addItem);

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isInStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#06B6D4] flex flex-col justify-between group h-full">
      <div>
        {/* Изображение с бейджем наличия */}
        <div className="aspect-square bg-[#F8FAFC] rounded-lg relative overflow-hidden mb-3.5 flex items-center justify-center p-3">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Статус наличия */}
          <div className="absolute top-2.5 left-2.5">
            {isInStock ? (
              isLowStock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Осталось {product.stock} шт.
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  В наличии
                </span>
              )
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                Нет в наличии
              </span>
            )}
          </div>
        </div>

        {/* Категория и бренд */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
          <span>{product.categoryName}</span>
          <span>{product.brand}</span>
        </div>

        {/* Название */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 min-h-[40px] group-hover:text-[#06B6D4] transition-colors mb-3">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Нижняя часть: Цена и Кнопка */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-slate-400">Цена:</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {product.price.toLocaleString("ru-RU")} ₽
          </span>
        </div>

        {isInStock ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isAdded
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-[#0F172A] hover:bg-[#06B6D4] text-white active:scale-98"
            }`}
            aria-label={`Добавить в корзину ${product.name}`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 animate-in zoom-in" />
                <span>Добавлено</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>В корзину</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-2.5 px-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span>Нет в наличии</span>
          </button>
        )}
      </div>
    </div>
  );
}
