"use client";

import { useState } from "react";
import { ShoppingCart, Check, Plus, Minus, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useTranslation } from "@/context/language-context";
import { getLocalizedProduct } from "@/i18n";

interface ProductBuyBoxProps {
  product: Product;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export function ProductBuyBox({
  product,
  quantity,
  onQuantityChange,
}: ProductBuyBoxProps) {
  const { formatPrice } = useCurrency();
  const { t, locale } = useTranslation();
  const [isAdded, setIsAdded] = useState(false);

  const localized = getLocalizedProduct(product, locale);

  const addItem = useCart((state) => state.addItem);
  const quantityInCart = useCart(
    (state) =>
      state.items.find((item) => item.productId === product.id)?.quantity ?? 0
  );

  const availableStock = Math.max(0, product.stock - quantityInCart);
  const isPhysicallyInStock = product.stock > 0;
  const canAddToCart = availableStock > 0;

  // Ограничиваем выбранное количество реально доступным остатком
  const effectiveQty = canAddToCart
    ? Math.min(Math.max(1, quantity), availableStock)
    : 0;
  const displayQty = canAddToCart ? effectiveQty : 1;
  const totalPrice = product.price * displayQty;

  const handleIncrement = () => {
    if (effectiveQty < availableStock) {
      onQuantityChange(effectiveQty + 1);
    }
  };

  const handleDecrement = () => {
    if (effectiveQty > 1) {
      onQuantityChange(effectiveQty - 1);
    }
  };

  const handleAddToCart = () => {
    if (!canAddToCart || effectiveQty <= 0) return;

    addItem({
      productId: product.id,
      name: product.name,
      translations: product.translations,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: effectiveQty,
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
        <span>{localized.categoryName}</span>
        <span className="text-[#06B6D4]">{localized.brand}</span>
      </div>

      {/* 2. Заголовок */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
        {localized.name}
      </h1>

      {/* 3. Краткое описание */}
      <p className="text-sm text-slate-600 leading-relaxed">
        {localized.shortDescription}
      </p>

      {/* 4. Блок цены и Итого */}
      <div className="pt-3 pb-3 border-y border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{t("product.pricePerItem")}</span>
          <span className="font-mono font-semibold text-slate-700">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1 border-t border-slate-50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t("product.total")}
            </span>
            {canAddToCart && effectiveQty > 1 && (
              <span className="text-xs text-[#06B6D4] font-medium">
                {t("product.forCount", { count: effectiveQty })}
              </span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
            {formatPrice(totalPrice)}
          </div>
        </div>
      </div>

      {/* 5. Выбор количества и кнопка добавления */}
      <div className="space-y-4">
        {!isPhysicallyInStock ? (
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>{t("product.outOfStockTemp")}</span>
            </button>
          </div>
        ) : availableStock === 0 ? (
          <div className="space-y-3">
            <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 text-center font-medium">
              {t("product.allInCart", { count: product.stock })}
            </div>
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base bg-slate-100 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>{t("product.inCartCount", { count: quantityInCart })}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t("product.quantity")}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {availableStock <= 3 ? (
                  <span className="text-amber-600 font-semibold">
                    {t("product.lowStock", { count: availableStock })}
                  </span>
                ) : (
                  <span>{t("product.inStock", { count: availableStock })}</span>
                )}
                {quantityInCart > 0 && (
                  <span className="text-slate-400 ml-1">
                    {t("product.inCartLabel", { count: quantityInCart })}
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Селектор - / + */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={effectiveQty <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label={t("product.decreaseQuantity")}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-mono font-bold text-base text-slate-900 select-none">
                  {effectiveQty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={effectiveQty >= availableStock}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label={t("product.increaseQuantity")}
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
                    <span>{t("product.added", { count: effectiveQty })}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>{t("product.addToCart")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Преимущества сервиса */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-2.5 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{t("product.guarantee")}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#06B6D4] shrink-0" />
          <span>{t("product.fastDelivery")}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>{t("product.freeReturnsSub")}</span>
        </div>
      </div>
    </div>
  );
}
