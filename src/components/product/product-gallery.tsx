/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const images = product.images?.length ? product.images : [product.image];
  const hasMultipleImages = images.length > 1;

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages || touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const swipeThreshold = 40;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const activeImage = images[selectedIndex] || product.image;

  return (
    <div className="w-full space-y-4">
      {/* 1. Большое основное изображение */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="aspect-square w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-10 relative overflow-hidden flex items-center justify-center shadow-xs select-none group"
      >
        {/* Бейдж наличия */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          {isInStock ? (
            isLowStock ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                Осталось {product.stock} шт.
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                В наличии
              </span>
            )
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
              Нет в наличии
            </span>
          )}
        </div>

        {/* Основное фото */}
        <img
          key={activeImage}
          src={activeImage}
          alt={`${product.name} — фото ${selectedIndex + 1}`}
          className="w-full h-full object-contain max-h-[460px] drop-shadow-sm transition-all duration-300 pointer-events-none animate-in fade-in"
          loading="eager"
        />

        {/* Стрелки переключения (только при нескольких фото) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Предыдущее изображение"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-[#06B6D4] hover:bg-white transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Следующее изображение"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:text-[#06B6D4] hover:bg-white transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* 2. Ряд миниатюр (Thumbnails) */}
      {hasMultipleImages && (
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {images.map((imgUrl, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={imgUrl + index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Выбрать фото ${index + 1}`}
                className={`aspect-square w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#F8FAFC] border rounded-xl p-1.5 flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  isSelected
                    ? "border-[#06B6D4] ring-2 ring-[#06B6D4] shadow-xs opacity-100 scale-102"
                    : "border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} — миниатюра ${index + 1}`}
                  className="w-full h-full object-contain pointer-events-none"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
