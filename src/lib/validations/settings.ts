import { z } from "zod";

export const updateShopSettingsSchema = z.object({
  phone: z
    .string()
    .min(1, "Телефон обязателен для заполнения")
    .trim()
    .min(5, "Телефон не может быть короче 5 символов")
    .max(50, "Телефон не может быть длиннее 50 символов"),
  email: z
    .string()
    .min(1, "Email обязателен для заполнения")
    .trim()
    .email("Некорректный формат email адреса")
    .max(100, "Email не может быть длиннее 100 символов"),
  address: z
    .string()
    .min(1, "Адрес магазина обязателен для заполнения")
    .trim()
    .min(3, "Адрес не может быть короче 3 символов")
    .max(255, "Адрес не может быть длиннее 255 символов"),
  workingHours: z
    .string()
    .min(1, "Режим работы обязателен для заполнения")
    .trim()
    .min(3, "Режим работы не может быть короче 3 символов")
    .max(100, "Режим работы не может быть длиннее 100 символов"),
  deliveryCostUzs: z
    .number()
    .int("Стоимость доставки должна быть целым числом")
    .min(0, "Стоимость доставки не может быть отрицательной")
    .max(10000000, "Стоимость доставки не может превышать 10 000 000 сум"),
  freeDeliveryThresholdUzs: z
    .number()
    .int("Порог бесплатной доставки должен быть целым числом")
    .min(0, "Порог бесплатной доставки не может быть отрицательным")
    .max(100000000, "Порог бесплатной доставки не может превышать 100 000 000 сум"),
  stickyTopBar: z.boolean().default(false),
});

export type UpdateShopSettingsInput = z.infer<typeof updateShopSettingsSchema>;

const localizedFeatureSchema = z.object({
  title: z
    .string()
    .trim()
    .max(60, "Заголовок преимущества не может быть длиннее 60 символов"),
  description: z
    .string()
    .trim()
    .max(100, "Описание преимущества не может быть длиннее 100 символов"),
});

const requiredLocalizedFeatureSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Заголовок преимущества обязателен для заполнения")
    .max(60, "Заголовок преимущества не может быть длиннее 60 символов"),
  description: z
    .string()
    .trim()
    .min(1, "Описание преимущества обязательно для заполнения")
    .max(100, "Описание преимущества не может быть длиннее 100 символов"),
});

const localizedTextSchema = z.object({
  title: z
    .string()
    .trim()
    .max(150, "Заголовок не может быть длиннее 150 символов"),
  content: z
    .string()
    .trim()
    .max(3000, "Текст не может быть длиннее 3000 символов"),
  features: z.tuple([
    localizedFeatureSchema,
    localizedFeatureSchema,
    localizedFeatureSchema,
  ]),
});

const requiredLocalizedTextSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Заголовок на русском языке обязателен для заполнения")
    .max(150, "Заголовок не может быть длиннее 150 символов"),
  content: z
    .string()
    .trim()
    .min(1, "Текст на русском языке обязателен для заполнения")
    .max(3000, "Текст не может быть длиннее 3000 символов"),
  features: z.tuple([
    requiredLocalizedFeatureSchema,
    requiredLocalizedFeatureSchema,
    requiredLocalizedFeatureSchema,
  ]),
});

export const updateHomeTextBlockSchema = z.object({
  enabled: z.boolean({
    message: "Флаг активности блока обязателен",
  }),
  ru: requiredLocalizedTextSchema,
  uz: localizedTextSchema,
  en: localizedTextSchema,
});

export type UpdateHomeTextBlockInput = z.infer<typeof updateHomeTextBlockSchema>;
