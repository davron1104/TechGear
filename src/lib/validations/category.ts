import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно для заполнения")
    .max(50, "Название не может превышать 50 символов"),
  slug: z
    .string()
    .min(1, "Слаг обязателен для заполнения")
    .regex(/^[a-z0-9-]+$/, "Слаг должен состоять только из латинских букв в нижнем регистре, цифр и дефисов")
    .max(50, "Слаг не может превышать 50 символов"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
