import { CategoryTranslations } from "./product";

/**
 * Типы категорий каталога TechGear на основе ТЗ
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  translations?: CategoryTranslations | null;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Клавиатуры",
    slug: "keyboards",
    translations: {
      uz: { name: "Klaviaturalar" },
      en: { name: "Keyboards" },
    },
  },
  {
    id: "2",
    name: "Мыши",
    slug: "mice",
    translations: {
      uz: { name: "Sichqonchalar" },
      en: { name: "Mice" },
    },
  },
  {
    id: "3",
    name: "Гарнитуры",
    slug: "headsets",
    translations: {
      uz: { name: "Quloqchinlar" },
      en: { name: "Headsets" },
    },
  },
  {
    id: "4",
    name: "Мониторы",
    slug: "monitors",
    translations: {
      uz: { name: "Monitorlar" },
      en: { name: "Monitors" },
    },
  },
  {
    id: "5",
    name: "Накопители",
    slug: "storage",
    translations: {
      uz: { name: "Xotira disklari" },
      en: { name: "Storage" },
    },
  },
  {
    id: "6",
    name: "Аксессуары",
    slug: "accessories",
    translations: {
      uz: { name: "Aksessuarlar" },
      en: { name: "Accessories" },
    },
  },
];
