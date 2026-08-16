import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      {/* 1. Минималистичная шапка: только логотип и ссылка возврата */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#0F172A] hover:opacity-95 transition-opacity"
          >
            TechGear<span className="text-[#06B6D4] text-3xl leading-none">.</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#06B6D4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Вернуться в магазин</span>
            <span className="sm:hidden">В магазин</span>
          </Link>
        </div>
      </header>

      {/* 2. Рабочая область оформления заказа */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>

      {/* 3. Компактный подвал */}
      <footer className="w-full py-6 px-4 border-t border-slate-200 bg-white text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>© 2026 TechGear. Все права защищены.</span>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span className="hover:text-slate-700 transition-colors cursor-pointer">
              Политика конфиденциальности
            </span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors cursor-pointer">
              Пользовательское соглашение
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
