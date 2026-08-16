import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { CategoryBar } from "@/components/layout/category-bar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <Suspense
        fallback={<div className="h-14 bg-white border-b border-slate-200" />}
      >
        <CategoryBar />
      </Suspense>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
