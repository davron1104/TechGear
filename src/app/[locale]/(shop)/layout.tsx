import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { CategoryBar } from "@/components/layout/category-bar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import prisma from "@/lib/prisma";
import { getShopSettings } from "@/lib/settings-server";
import { Category } from "@/types/category";
import { CategoryTranslations } from "@/types/product";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Загружаем категории и настройки магазина параллельно
  const [categories, shopSettings] = await Promise.all([
    prisma.category.findMany(),
    getShopSettings(),
  ]);

  // Приводим категории к строгому типу Category
  const typedCategories: Category[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    translations: (cat.translations as CategoryTranslations | null) ?? null,
  }));

  // Сохраняем исходный визуальный порядок категорий
  const categoryOrder = ["keyboards", "mice", "headsets", "monitors", "storage", "accessories"];
  const sortedCategories = [...typedCategories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.slug);
    const indexB = categoryOrder.indexOf(b.slug);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Новые категории сортируем по алфавиту
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <Header shopSettings={shopSettings} categories={sortedCategories} />
      <Suspense
        fallback={<div className="hidden lg:block h-14 bg-white border-b border-slate-200" />}
      >
        <CategoryBar categories={sortedCategories} />
      </Suspense>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
      <Footer shopSettings={shopSettings} />
      <CartDrawer />
    </>
  );
}
