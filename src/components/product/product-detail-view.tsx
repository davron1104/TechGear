"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { ProductGallery } from "./product-gallery";
import { ProductBuyBox } from "./product-buy-box";
import { ProductSpecs } from "./product-specs";
import { ProductStickyBar } from "./product-sticky-bar";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(product.stock > 0 ? 1 : 0);

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
            onQuantityChange={setQuantity}
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
