import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email обязателен для заполнения")
    .email("Введите корректный адрес электронной почты"),
  password: z
    .string()
    .min(1, "Пароль обязателен для заполнения")
    .min(6, "Пароль должен содержать минимум 6 символов"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Имя обязательно для заполнения")
      .min(2, "Имя должно содержать минимум 2 символа")
      .max(50, "Имя не может превышать 50 символов"),
    email: z
      .string()
      .min(1, "Email обязателен для заполнения")
      .email("Введите корректный адрес электронной почты"),
    password: z
      .string()
      .min(1, "Пароль обязателен для заполнения")
      .min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z
      .string()
      .min(1, "Подтверждение пароля обязательно"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email обязателен для заполнения")
    .email("Введите корректный адрес электронной почты"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const setNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Пароль обязателен для заполнения")
      .min(6, "Пароль должен содержать минимум 6 символов"),
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type SetNewPasswordInput = z.infer<typeof setNewPasswordSchema>;

