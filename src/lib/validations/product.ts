import { z } from "zod";

export const productTranslationSchema = z.object({
  name: z.string().max(200, "Максимум 200 символов").optional(),
  shortDescription: z.string().max(500, "Максимум 500 символов").optional(),
  description: z.string().optional(),
  characteristics: z.record(z.string(), z.string()).optional(),
});

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
    .max(99_999_999.99, "Цена не может превышать 99 999 999.99"),
  brand: z
    .string()
    .min(1, "Бренд обязателен")
    .max(100, "Максимум 100 символов"),
  stock: z
    .number({ error: "Количество должно быть числом" })
    .int("Целое число")
    .min(0, "Не может быть отрицательным"),
  image: z
    .string()
    .min(1, "Изображение обязательно")
    .refine(
      (val) => val.startsWith("/") || /^https?:\/\//i.test(val),
      "Введите корректный URL или выберите файл изображения"
    ),
  images: z
    .array(
      z
        .string()
        .refine(
          (val) => val.startsWith("/") || /^https?:\/\//i.test(val),
          "Введите корректный URL или путь к изображению"
        )
    )
    .default([]),
  shortDescription: z
    .string()
    .min(1, "Краткое описание обязательно")
    .max(500, "Максимум 500 символов"),
  description: z.string().min(1, "Описание обязательно"),
  characteristics: z.record(z.string(), z.string()),
  translations: z
    .object({
      uz: productTranslationSchema.optional(),
      en: productTranslationSchema.optional(),
    })
    .optional()
    .nullable(),
  isPopular: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductTranslationInput = z.infer<typeof productTranslationSchema>;
