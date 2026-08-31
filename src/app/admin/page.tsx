import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  Package,
  Layers,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sliders,
  DollarSign,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Панель администратора — TechGear Admin",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Загрузка реальных показателей из БД Prisma
  const [
    activeProductsCount,
    softDeletedProductsCount,
    categoriesCount,
    ordersCount,
    usersCount,
    lowStockCount,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: { not: null } } }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where: { deletedAt: null, stock: { lte: 3 } } }),
    prisma.product.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { name: true },
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Активные товары",
      value: activeProductsCount,
      subValue:
        softDeletedProductsCount > 0
          ? `+${softDeletedProductsCount} скрыто (Soft Delete)`
          : "Все товары активны",
      icon: Package,
      iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
      href: "/admin/products",
    },
    {
      title: "Категории каталога",
      value: categoriesCount,
      subValue: "Разделы магазина",
      icon: Layers,
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
      href: "/admin/categories",
    },
    {
      title: "Всего заказов",
      value: ordersCount,
      subValue: ordersCount === 0 ? "Ожидаются первые заказы" : "В базе данных",
      icon: ShoppingBag,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      href: "/admin/orders",
    },
    {
      title: "Пользователи",
      value: usersCount,
      subValue: "Зарегистрировано",
      icon: Users,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
      href: "#",
    },
  ];

  const quickLinks = [
    {
      title: "Управление товарами",
      description:
        "Создание, редактирование, изменение цен, управление остатками на складе и загрузка изображений через Cloudinary.",
      href: "/admin/products",
      icon: Package,
      badge: `${activeProductsCount} товаров`,
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
      title: "Управление категориями",
      description:
        "Добавление новых категорий девайсов, настройка slug для URL-адресов и привязка товаров.",
      href: "/admin/categories",
      icon: Layers,
      badge: `${categoriesCount} категорий`,
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      title: "Управление заказами",
      description:
        "Просмотр оформленных заказов покупателей, подтверждение и смена статусов доставки.",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: `${ordersCount} заказов`,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Настройки и курс валют",
      description:
        "Управление курсом пересчета USD к базовой валюте UZS и системными параметрами магазина.",
      href: "/admin/settings",
      icon: DollarSign,
      badge: "Курс USD",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Admin Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-[#0F172A] tracking-tight">
              TechGear
              <span className="text-[#06B6D4] font-normal"> Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-semibold">
              <Link
                href="/admin"
                className="text-[#06B6D4] border-b-2 border-[#06B6D4] py-4"
              >
                Обзор
              </Link>
              <Link
                href="/admin/categories"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Категории
              </Link>
              <Link
                href="/admin/products"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Товары
              </Link>
              <Link
                href="/admin/orders"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Заказы
              </Link>
              <Link
                href="/admin/settings"
                className="text-slate-500 hover:text-slate-900 transition-colors py-4"
              >
                Настройки
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> В магазин
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Welcome Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Панель активна
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Администратор: {session.user.name || session.user.email}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Панель администратора TechGear
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Сводная статистика интернет-магазина, управление товарами, категориями и заказами.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <span>Открыть витрину</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#06B6D4] text-white text-xs font-bold transition-all shadow-md"
            >
              <span>+ Добавить товар</span>
            </Link>
          </div>
        </div>

        {/* Low stock alert banner */}
        {lowStockCount > 0 && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Внимание:</strong> у {lowStockCount} товаров заканчивается остаток на складе (3 шт. или меньше).
              </span>
            </div>
            <Link
              href="/admin/products"
              className="font-bold text-amber-900 hover:underline shrink-0 flex items-center gap-1"
            >
              Проверить остатки <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Key Metrics Cards */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Ключевые показатели
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all duration-200 group block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {item.title}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${item.iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {item.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium truncate">
                    {item.subValue}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick Navigation Cards */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Быстрый переход к разделам
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${link.badgeColor}`}
                      >
                        {link.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {link.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#06B6D4] hover:text-[#0891B2] transition-colors group"
                    >
                      <span>Перейти в раздел</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recently Added Products List */}
        {recentProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Недавно добавленные товары
              </h2>
              <Link
                href="/admin/products"
                className="text-xs font-semibold text-[#06B6D4] hover:underline"
              >
                Все товары ({activeProductsCount}) →
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {recentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                            {p.category.name}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-300" />
                            {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-slate-900">
                          {Number(p.price).toLocaleString("ru-RU")} ₽
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Остаток: {p.stock} шт.
                        </div>
                      </div>
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                        title="Открыть страницу товара"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
