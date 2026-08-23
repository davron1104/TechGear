import Link from "next/link";
import { 
  Keyboard, 
  Mouse, 
  Headphones, 
  Monitor, 
  HardDrive, 
  Laptop, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";
import { HeroBanner } from "@/components/catalog/hero-banner";
import { ProductCard } from "@/components/catalog/product-card";
import { getPublicProducts } from "@/lib/products";
import prisma from "@/lib/prisma";

// Красивое соответствие иконок и цветов для каждой категории
const CATEGORY_META = {
  keyboards: {
    icon: Keyboard,
    bgGradient: "from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-300",
  },
  mice: {
    icon: Mouse,
    bgGradient: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "hover:border-emerald-300",
  },
  headsets: {
    icon: Headphones,
    bgGradient: "from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "hover:border-purple-300",
  },
  monitors: {
    icon: Monitor,
    bgGradient: "from-cyan-500/10 to-sky-500/10 hover:from-cyan-500/20 hover:to-cyan-500/20",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "hover:border-cyan-300",
  },
  storage: {
    icon: HardDrive,
    bgGradient: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "hover:border-amber-300",
  },
  accessories: {
    icon: Laptop,
    bgGradient: "from-rose-500/10 to-red-500/10 hover:from-rose-500/20 hover:to-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderColor: "hover:border-rose-300",
  },
};

export default async function HomePage() {
  // В качестве популярных выбираем первые 4 активных товара в наличии из БД
  const popularProducts = await getPublicProducts({ inStockOnly: true, limit: 4 });

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
    <div className="w-full pb-16 space-y-16">
      {/* 1. Hero-баннер */}
      <HeroBanner />

      {/* 2. Блок категорий товаров */}
      <section className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Категории товаров</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-xl">
            Выберите интересующий раздел, чтобы просмотреть высококлассные девайсы и комплектующие.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sortedCategories.map((category) => {
            const meta = CATEGORY_META[category.slug as keyof typeof CATEGORY_META] || {
              icon: Laptop,
              bgGradient: "from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200",
              iconColor: "text-slate-600",
              borderColor: "hover:border-slate-300",
            };
            const Icon = meta.icon;

            return (
              <Link
                key={category.id}
                href={`/catalog/${category.slug}`}
                className={`group flex flex-col items-center justify-center p-6 bg-gradient-to-br ${meta.bgGradient} border border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${meta.borderColor}`}
              >
                <div className={`p-4 rounded-xl bg-white shadow-xs group-hover:scale-110 transition-transform duration-300 ${meta.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="mt-4 text-sm font-semibold text-slate-800 group-hover:text-slate-950 transition-colors text-center">
                  {category.name}
                </span>
                <div className="mt-2 flex items-center text-xs font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Перейти</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Секция «Популярные товары» */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>Популярные товары</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Наши лучшие предложения, заслужившие высокие оценки покупателей и киберспортсменов.
            </p>
          </div>

          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#06B6D4] hover:text-[#0891B2] transition-colors shrink-0 group"
          >
            <span>Смотреть весь каталог</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
