import { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/catalog-view";

export const metadata: Metadata = {
  title: "Каталог товаров — TechGear",
  description: "Широкий выбор профессиональной компьютерной техники, периферии и аксессуаров в интернет-магазине TechGear.",
};

export default function CatalogPage() {
  return (
    <div className="w-full pb-12">
      <Suspense
        fallback={
          <div className="w-full py-20 text-center text-slate-400">
            Загрузка каталога...
          </div>
        }
      >
        <CatalogView categorySlug={null} />
      </Suspense>
    </div>
  );
}
