"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { ProductGallery } from "./product-gallery";
import { ProductBuyBox } from "./product-buy-box";
import { ProductSpecs } from "./product-specs";
import { ProductStickyBar } from "./product-sticky-bar";

// Module-level cache to preserve user-selected quantities across locale/page transitions
const productDraftQuantities = new Map<string, number>();

export function getDraftQuantity(productId: string): number | undefined {
  return productDraftQuantities.get(productId);
}

export function clearDraftQuantities(): void {
  productDraftQuantities.clear();
}

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState<number>(() => {
    if (product.stock <= 0) return 0;
    const cached = productDraftQuantities.get(product.id);
    if (typeof cached === "number" && cached > 0) {
      return Math.min(cached, product.stock);
    }
    return 1;
  });

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, Math.min(newQty, product.stock));
    setQuantity(validQty);
    productDraftQuantities.set(product.id, validQty);
  };

  return (
    <div className="w-full pb-20 lg:pb-12">
      {/* Основной двухколоночный блок товара */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Левая колонка: Галерея / Крупное фото */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <ProductGallery product={product} />
        </div>

        {/* Правая колонка: Блок покупки и описания */}
        <div className="lg:col-span-6">
          <ProductBuyBox
            product={product}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
          />
        </div>
      </div>

      {/* Секция подробного описания и характеристик */}
      <ProductSpecs product={product} />

      {/* Мобильная закрепленная полоса покупки с синхронизированным количеством */}
      <ProductStickyBar product={product} quantity={quantity} />
    </div>
  );
}
