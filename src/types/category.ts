/**
 * Типы категорий каталога TechGear на основе ТЗ
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Клавиатуры", slug: "keyboards" },
  { id: "2", name: "Мыши", slug: "mice" },
  { id: "3", name: "Гарнитуры", slug: "headsets" },
  { id: "4", name: "Мониторы", slug: "monitors" },
  { id: "5", name: "Накопители", slug: "storage" },
  { id: "6", name: "Аксессуары", slug: "accessories" },
];
