import { z } from "zod";
import { checkoutSchema } from "./checkout";

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "Идентификатор товара обязателен"),
  quantity: z
    .number()
    .int("Количество должно быть целым числом")
    .min(1, "Количество должно быть не менее 1"),
});

export const createOrderSchema = checkoutSchema.extend({
  items: z.array(orderItemInputSchema).default([]),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
