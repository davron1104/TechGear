import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { CategoryBar } from "@/components/layout/category-bar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import prisma from "@/lib/prisma";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Загружаем категории из БД
  const categories = await prisma.category.findMany();

  // Сохраняем исходный визуальный порядок категорий
  const categoryOrder = ["keyboards", "mice", "headsets", "monitors", "storage", "accessories"];
  const sortedCategories = [...categories].sort((a, b) => {
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
      <Header />
      <Suspense
        fallback={<div className="h-14 bg-white border-b border-slate-200" />}
      >
        <CategoryBar categories={sortedCategories} />
      </Suspense>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
