/* eslint-disable @next/next/no-img-element */
import { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div className="w-full">
      <div className="aspect-square w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 sm:p-10 relative overflow-hidden flex items-center justify-center shadow-xs">
        {/* Бейдж наличия */}
        <div className="absolute top-4 left-4 z-10">
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

        {/* Большое изображение товара */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain max-h-[460px] drop-shadow-sm hover:scale-105 transition-transform duration-300"
          loading="eager"
        />
      </div>
    </div>
  );
}
