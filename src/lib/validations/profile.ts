import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Имя обязательно для заполнения")
    .min(2, "Имя должно содержать не менее 2 символов")
    .max(50, "Имя не должно превышать 50 символов"),
  email: z
    .string()
    .min(1, "Email обязателен для заполнения")
    .email("Введите корректный адрес электронной почты"),
  phone: z
    .string()
    .min(1, "Телефон обязателен для заполнения")
    .min(10, "Номер телефона должен содержать минимум 10 цифр"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
