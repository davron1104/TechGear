/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useTranslation } from "@/context/language-context";
import { getLocalizedProduct } from "@/i18n";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { t, locale } = useTranslation();
  const [isAdded, setIsAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const localized = getLocalizedProduct(product, locale);

  const addItem = useCart((state) => state.addItem);
  const quantityInCart = useCart(
    (state) =>
      state.items.find((item) => item.productId === product.id)?.quantity ?? 0
  );

  const availableStock = Math.max(0, product.stock - quantityInCart);
  const isPhysicallyInStock = product.stock > 0;
  const canAddToCart = availableStock > 0;

  const images = product.images?.length ? product.images : [product.image];

  // Переключение по зонам движения мыши (Hover scrubbing)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (width <= 0) return;

    const segmentWidth = width / images.length;
    const index = Math.min(
      Math.max(Math.floor(x / segmentWidth), 0),
      images.length - 1
    );

    if (index !== activeImageIndex) {
      setActiveImageIndex(index);
    }
  };

  // Сброс к первому фото при уходе курсора
  const handleMouseLeave = () => {
    if (images.length <= 1) return;
    setActiveImageIndex(0);
  };

  // Touch Swipe для мобильных устройств
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (images.length <= 1 || touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const swipeThreshold = 35;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Свайп влево -> следующее изображение
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Свайп вправо -> предыдущее изображение
        setActiveImageIndex(
          (prev) => (prev - 1 + images.length) % images.length
        );
      }
    }
    touchStartX.current = null;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canAddToCart) return;

    addItem({
      productId: product.id,
      name: product.name,
      translations: product.translations,
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

  const currentImage = images[activeImageIndex] || product.image;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#06B6D4] flex flex-col justify-between group h-full select-none">
      <div>
        {/* Интерактивная область изображения товара */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="aspect-square bg-[#F8FAFC] rounded-lg relative overflow-hidden mb-3.5 flex items-center justify-center p-3 cursor-pointer"
        >
          <img
            src={currentImage}
            alt={localized.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 pointer-events-none"
          />

          {/* Статус наличия с учётом товаров в корзине */}
          <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
            {!isPhysicallyInStock ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                {t("product.outOfStock")}
              </span>
            ) : availableStock === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                {t("product.maxInCart")}
              </span>
            ) : availableStock <= 3 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                {t("product.lowStock", { count: availableStock })}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t("product.inStock", { count: availableStock })}
              </span>
            )}
          </div>

          {/* Тонкий сегментированный индикатор нескольких фото */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 inset-x-4 flex items-center gap-1.5 z-10 pointer-events-none">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-200 ${
                    idx === activeImageIndex
                      ? "bg-[#06B6D4] shadow-xs"
                      : "bg-slate-300/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Категория и бренд */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
          <span>{localized.categoryName}</span>
          <span>{localized.brand}</span>
        </div>

        {/* Название */}
        <Link href={`/product/${localized.slug}`}>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 min-h-[40px] group-hover:text-[#06B6D4] transition-colors mb-3">
            {localized.name}
          </h3>
        </Link>
      </div>

      {/* Нижняя часть: Цена и Кнопка */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-slate-400">{t("product.pricePerItem")}</span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {formatPrice(product.price)}
          </span>
        </div>

        {!isPhysicallyInStock ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 px-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span>{t("product.outOfStock")}</span>
          </button>
        ) : availableStock === 0 ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 px-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-500 cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span>{t("product.maxInCart")}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isAdded
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-[#0F172A] hover:bg-[#06B6D4] text-white active:scale-98"
            }`}
            aria-label={`${t("product.addToCart")}: ${localized.name}`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 animate-in zoom-in" />
                <span>{t("product.added")}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{t("product.addToCart")}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
