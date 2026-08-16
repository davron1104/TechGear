import { z } from "zod";

export const checkoutSchema = z
  .object({
    name: z
      .string()
      .min(1, "Укажите имя получателя")
      .min(2, "Имя должно содержать не менее 2 символов")
      .max(50, "Имя не должно превышать 50 символов"),
    email: z
      .string()
      .min(1, "Укажите адрес электронной почты")
      .email("Введите корректный email для отправки чека"),
    phone: z
      .string()
      .min(1, "Укажите номер телефона")
      .min(10, "Номер телефона должен содержать минимум 10 цифр"),
    deliveryMethod: z.enum(["courier", "pickup"], {
      message: "Выберите способ доставки",
    }),
    city: z.string().min(1, "Укажите город доставки"),
    street: z.string().optional(),
    house: z.string().optional(),
    apartment: z.string().optional(),
    comment: z.string().max(300, "Комментарий не должен превышать 300 символов").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "courier") {
      if (!data.street || data.street.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите улицу для курьерской доставки",
          path: ["street"],
        });
      }
      if (!data.house || data.house.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите номер дома",
          path: ["house"],
        });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
