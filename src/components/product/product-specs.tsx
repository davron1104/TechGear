"use client";

import { Product } from "@/types/product";
import { useTranslation } from "@/context/language-context";
import { getLocalizedProduct } from "@/i18n";

interface ProductSpecsProps {
  product: Product;
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  const { t, locale } = useTranslation();
  const localized = getLocalizedProduct(product, locale);
  const specsEntries = Object.entries(localized.characteristics || {});

  return (
    <div className="w-full space-y-8 mt-12 pt-8 border-t border-slate-200">
      {/* 1. Подробное описание товара */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          {t("product.description")}
        </h2>
        <div className="text-sm text-slate-700 leading-relaxed space-y-4">
          <p>{localized.description}</p>
        </div>
      </section>

      {/* 2. Таблица технических характеристик */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
          {t("product.characteristics")}
        </h2>

        {specsEntries.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <tbody>
                {specsEntries.map(([key, value], idx) => (
                  <tr
                    key={key}
                    className={`border-b border-slate-200 last:border-0 transition-colors ${
                      idx % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"
                    }`}
                  >
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-medium w-1/2">
                      {key}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-900 font-mono font-semibold w-1/2">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            {t("common.notFound")}
          </p>
        )}
      </section>
    </div>
  );
}
