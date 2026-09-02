import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { CheckoutFooter } from "@/components/checkout/checkout-footer";

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      {/* 1. Минималистичная шапка */}
      <CheckoutHeader />

      {/* 2. Рабочая область оформления заказа */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>

      {/* 3. Компактный подвал */}
      <CheckoutFooter />
    </div>
  );
}
