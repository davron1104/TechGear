import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { CartSyncProvider } from "@/components/cart/cart-sync-provider";
import { CurrencyProvider } from "@/context/currency-context";
import { getServerCurrency, getExchangeRate } from "@/lib/currency-server";
import { getBaseUrl } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "TechGear — Интернет-магазин компьютерной техники и аксессуаров",
  description:
    "Премиальная компьютерная периферия, клавиатуры, мыши, гарнитуры, мониторы и аксессуары с быстрой доставкой.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialCurrency, initialExchangeRate] = await Promise.all([
    getServerCurrency(),
    getExchangeRate(),
  ]);

  return (
    <html
      lang="ru"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
        <SessionProvider>
          <CurrencyProvider
            initialCurrency={initialCurrency}
            initialExchangeRate={initialExchangeRate}
          >
            <CartSyncProvider />
            {children}
          </CurrencyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
