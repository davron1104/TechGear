/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl mb-10 text-white">
      {/* Декоративное неоновое циановое свечение (радиальный градиент) */}
      <div className="absolute -right-20 -top-20 w-[450px] h-[450px] bg-[#06B6D4]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Левая текстовая колонка */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-[#06B6D4] text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Флагманские девайсы нового поколения</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Прокачай свой сетап с <span className="text-[#06B6D4]">TechGear</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
            Механические клавиатуры на заказных свитчах, сверхлегкие мыши 26K DPI и мониторы с частотой до 240 Гц. Точность в каждом клике.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/catalog"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-6 py-3.5 rounded-lg shadow-md transition-all duration-200 hover:scale-[1.02] flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Смотреть каталог</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Плашки преимуществ */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>Быстрая отправка</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Гарантия 12 мес.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#06B6D4] shrink-0" />
              <span>100% Оригинал</span>
            </div>
          </div>
        </div>

        {/* Правая колонка: Промо-визуал флагманского товара */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="relative p-6 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-2xl">
            <div className="absolute top-4 right-4 bg-[#F59E0B] text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              Хит продаж
            </div>

            <div className="aspect-4/3 rounded-lg overflow-hidden mb-4 bg-slate-950/40 flex items-center justify-center p-2">
              <img
                src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
                alt="CyberKeys Pro RGB"
                className="w-full h-full object-cover rounded-md transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div>
              <div className="text-xs text-[#06B6D4] font-mono uppercase mb-1">
                Клавиатуры • Hot-Swap
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                CyberKeys Pro RGB Wireless
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white">
                  8 990 ₽
                </span>
                <Link
                  href="/product/cyberkeys-pro-rgb"
                  className="text-xs font-semibold text-[#06B6D4] hover:text-[#0891B2] flex items-center gap-1 underline underline-offset-4"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
