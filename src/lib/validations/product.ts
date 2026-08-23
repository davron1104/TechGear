import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(200, "Максимум 200 символов"),
  slug: z
    .string()
    .min(1, "Слаг обязателен")
    .max(200, "Максимум 200 символов")
    .regex(
      /^[a-z0-9-]+$/,
      "Слаг: только латинские буквы, цифры и дефис"
    ),
  categoryId: z.string().min(1, "Выберите категорию"),
  price: z
    .number({ error: "Цена должна быть числом" })
    .positive("Цена должна быть больше 0")
    .max(10_000_000, "Цена не может превышать 10 000 000"),
  brand: z
    .string()
    .min(1, "Бренд обязателен")
    .max(100, "Максимум 100 символов"),
  stock: z
    .number({ error: "Количество должно быть числом" })
    .int("Целое число")
    .min(0, "Не может быть отрицательным"),
  image: z.string().url("Введите корректный URL изображения"),
  shortDescription: z
    .string()
    .min(1, "Краткое описание обязательно")
    .max(500, "Максимум 500 символов"),
  description: z.string().min(1, "Описание обязательно"),
  characteristics: z.record(z.string(), z.string()),
});

export type ProductInput = z.infer<typeof productSchema>;
