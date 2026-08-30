import Link from "next/link";
import { ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/types/category";

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-400 mt-auto border-t border-slate-800">
      {/* Верхний блок с преимуществами */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Оригинальные девайсы</h4>
              <p className="text-xs text-slate-400">100% гарантия подлинности</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Быстрая доставка</h4>
              <p className="text-xs text-slate-400">Бесплатно от 500 000 сум</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Легкий возврат</h4>
              <p className="text-xs text-slate-400">14 дней на проверку качества</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-[#06B6D4]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Поддержка 7 дней</h4>
              <p className="text-xs text-slate-400">Консультации экспертов</p>
            </div>
          </div>
        </div>
      </div>

      {/* Основной блок с колонками ссылок */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Колонка 1: О магазине */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-white flex items-center"
            >
              TechGear<span className="text-[#06B6D4] text-3xl leading-none">.</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Интернет-магазин профессиональной компьютерной техники, периферии и аксессуаров. Лучшие решения для геймеров и разработчиков.
            </p>
          </div>

          {/* Колонка 2: Каталог товаров */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Каталог
            </h3>
            <ul className="space-y-2 text-sm">
              {DEFAULT_CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/catalog/${category.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 3: Покупателям */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Покупателям
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Личный кабинет
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Вход / Регистрация
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Доставка и оплата</span>
              </li>
              <li>
                <span className="text-slate-400">Гарантия и сервис</span>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Контакты
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <strong className="text-slate-300">Телефон:</strong>{" "}
                <a
                  href="tel:88005553535"
                  className="hover:text-white text-[#06B6D4] font-medium"
                >
                  +7 (800) 555-35-35
                </a>
              </li>
              <li>
                <strong className="text-slate-300">Email:</strong>{" "}
                <span>support@techgear.ru</span>
              </li>
              <li>
                <strong className="text-slate-300">Режим работы:</strong>{" "}
                <span>Ежедневно с 09:00 до 21:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижний копирайт */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TechGear. Все права защищены.</p>
          <p>Разработано в соответствии со стандартами Design.md и SECURITY.md</p>
        </div>
      </div>
    </footer>
  );
}
