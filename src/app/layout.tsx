import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { CartSyncProvider } from "@/components/cart/cart-sync-provider";

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
  title: "TechGear — Интернет-магазин компьютерной техники и аксессуаров",
  description:
    "Премиальная компьютерная периферия, клавиатуры, мыши, гарнитуры, мониторы и аксессуары с быстрой доставкой.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
        <SessionProvider>
          <CartSyncProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
