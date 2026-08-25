"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations/order";
import { revalidatePath } from "next/cache";

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fields?: Record<string, string[]> };

export interface CreatedOrderData {
  id: string;
  orderNumber: string;
  totalAmount: number;
  goodsTotal: number;
  deliveryCost: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  city: string;
  street: string | null;
  house: string | null;
  apartment: string | null;
}

/**
 * Creates a new customer order.
 * - For authorized users: items composition is determined strictly by the server-side PostgreSQL cart (`CartItem`).
 * - For guests: items are validated from the client payload and aggregated by productId to prevent duplicate bypass.
 * - Zero-Trust: Prices, availability, and stock are strictly verified against PostgreSQL.
 * - Runs atomically inside `prisma.$transaction`.
 * - If authorized, clears the user's database cart upon success.
 * - Does NOT decrement stock yet (stock is decremented on NEW -> CONFIRMED by admin).
 */
export async function createOrder(
  data: unknown
): Promise<ActionResponse<CreatedOrderData>> {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const parseResult = createOrderSchema.safeParse(data);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Ошибка валидации данных заказа.",
        fields: parseResult.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const {
      name,
      email,
      phone,
      deliveryMethod,
      city,
      street,
      house,
      apartment,
      comment,
      items: guestItems,
    } = parseResult.data;

    const createdOrder = await prisma.$transaction(async (tx) => {
      let rawItems: Array<{ productId: string; quantity: number }> = [];

      if (userId) {
        // Для авторизованного пользователя состав корзины берётся ИСКЛЮЧИТЕЛЬНО из БД (Zero-Trust)
        const userCart = await tx.cart.findUnique({
          where: { userId },
          include: { items: true },
        });

        if (!userCart || userCart.items.length === 0) {
          throw new Error("Ваша корзина пуста. Добавьте товары перед оформлением заказа.");
        }

        rawItems = userCart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));
      } else {
        // Для гостя используем переданный список товаров
        if (!guestItems || guestItems.length === 0) {
          throw new Error("В заказе должен быть хотя бы один товар.");
        }
        rawItems = guestItems;
      }

      // 1. Агрегация и защита от дублирующихся productId (суммируем количества)
      const aggregatedMap = new Map<string, number>();
      for (const item of rawItems) {
        if (item.quantity <= 0) continue;
        const current = aggregatedMap.get(item.productId) ?? 0;
        aggregatedMap.set(item.productId, current + item.quantity);
      }

      const targetItems = Array.from(aggregatedMap.entries()).map(
        ([productId, quantity]) => ({ productId, quantity })
      );

      if (targetItems.length === 0) {
        throw new Error("В заказе должен быть хотя бы один товар с корректным количеством.");
      }

      // 2. Запрашиваем активные товары из БД
      const productIds = targetItems.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: {
          id: { in: productIds },
          deletedAt: null,
        },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // 3. Проверяем наличие и остаток для каждого товара по суммарному количеству
      for (const item of targetItems) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(
            "Один или несколько выбранных товаров не найдены или сняты с продажи."
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Товара «${product.name}» недостаточно на складе. Доступно: ${product.stock} шт., запрошено: ${item.quantity} шт.`
          );
        }
      }

      // 4. Серверный расчет стоимости товаров и доставки
      const goodsTotal = targetItems.reduce((sum, item) => {
        const product = productMap.get(item.productId)!;
        return sum + Number(product.price) * item.quantity;
      }, 0);

      // Доставка бесплатна при сумме от 5000 ₽ или при самовывозе
      const deliveryCost =
        deliveryMethod === "pickup" || goodsTotal >= 5000 ? 0 : 490;
      const totalAmount = goodsTotal + deliveryCost;

      // 5. Создание записи заказа Order и позиций OrderItem
      const order = await tx.order.create({
        data: {
          userId,
          status: "NEW",
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.toLowerCase().trim(),
          deliveryMethod,
          city: city.trim(),
          street: street?.trim() || null,
          house: house?.trim() || null,
          apartment: apartment?.trim() || null,
          comment: comment?.trim() || null,
          totalAmount,
          items: {
            create: targetItems.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
              };
            }),
          },
        },
      });

      // 6. Для авторизованного пользователя очищаем серверную корзину в БД
      if (userId) {
        const cart = await tx.cart.findUnique({
          where: { userId },
        });
        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }
      }

      const orderNumber = `TG-${order.id.slice(0, 5).toUpperCase()}`;

      return {
        id: order.id,
        orderNumber,
        totalAmount,
        goodsTotal,
        deliveryCost,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryMethod: order.deliveryMethod,
        city: order.city,
        street: order.street,
        house: order.house,
        apartment: order.apartment,
      };
    });

    try {
      revalidatePath("/account");
    } catch {
      // Игнорируем ошибки revalidatePath при выполнении вне контекста HTTP-запроса Next.js
    }

    return {
      success: true,
      data: createdOrder,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Системная ошибка при создании заказа.";
    console.error("Create order error:", error);
    return {
      success: false,
      error: message,
    };
  }
}
