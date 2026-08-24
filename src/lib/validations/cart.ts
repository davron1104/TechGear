import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid("Некорректный идентификатор товара"),
  quantity: z
    .number({ error: "Количество должно быть числом" })
    .int("Количество должно быть целым числом")
    .positive("Количество должно быть больше 0")
    .default(1),
});

export const updateCartQuantitySchema = z.object({
  productId: z.string().uuid("Некорректный идентификатор товара"),
  quantity: z
    .number({ error: "Количество должно быть числом" })
    .int("Количество должно быть целым числом")
    .min(0, "Количество не может быть отрицательным"),
});

export const guestCartItemSchema = z.object({
  productId: z.string().uuid("Некорректный идентификатор товара"),
  quantity: z
    .number({ error: "Количество должно быть числом" })
    .int("Количество должно быть целым числом")
    .positive("Количество должно быть больше 0"),
});

export const mergeCartSchema = z.array(guestCartItemSchema);

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
export type GuestCartItemInput = z.infer<typeof guestCartItemSchema>;
