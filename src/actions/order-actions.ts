"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getExchangeRate } from "@/lib/currency-server";
import { getShopSettings } from "@/lib/settings-server";
import {
  sendOrderTelegramNotification,
  TelegramOrderItem,
} from "@/lib/telegram";
import { createOrderSchema } from "@/lib/validations/order";
import { Order, OrderStatus } from "@/types/order";
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
  currency: string;
  exchangeRate: number;
}

interface DbOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  price: unknown;
  quantity: number;
  product?: { image: string | null; slug: string } | null;
}

interface DbOrder {
  id: string;
  createdAt: Date;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  city: string;
  street: string | null;
  house: string | null;
  apartment: string | null;
  comment: string | null;
  totalAmount: unknown;
  currency?: unknown;
  exchangeRate?: unknown;
  items: DbOrderItem[];
}

/**
 * Helper to map Prisma Order record to typed Order interface
 */
function formatOrderResponse(dbOrder: DbOrder): Order {
  const goodsTotal = dbOrder.items.reduce(
    (sum: number, item: DbOrderItem) => sum + Number(item.price) * item.quantity,
    0
  );
  const totalAmountNum = Number(dbOrder.totalAmount);
  const deliveryCost = Math.max(0, totalAmountNum - goodsTotal);

  const address =
    dbOrder.street && dbOrder.house
      ? `ул. ${dbOrder.street}, д. ${dbOrder.house}${
          dbOrder.apartment ? `, кв. ${dbOrder.apartment}` : ""
        }`
      : undefined;

  return {
    id: dbOrder.id,
    orderNumber: `TG-${dbOrder.id.slice(0, 5).toUpperCase()}`,
    createdAt: dbOrder.createdAt.toISOString(),
    status: dbOrder.status as OrderStatus,
    customerName: dbOrder.customerName,
    email: dbOrder.customerEmail,
    phone: dbOrder.customerPhone,
    deliveryMethod: dbOrder.deliveryMethod as "courier" | "pickup",
    city: dbOrder.city,
    address,
    comment: dbOrder.comment || undefined,
    items: dbOrder.items.map((item: DbOrderItem) => ({
      id: item.id,
      productId: item.productId || "",
      name: item.productName,
      price: Number(item.price),
      quantity: item.quantity,
      image: item.product?.image || "/uploads/products/placeholder.png",
    })),
    totalPrice: goodsTotal,
    deliveryCost,
    finalTotal: Number(dbOrder.totalAmount),
    currency: dbOrder.currency ? String(dbOrder.currency) : "UZS",
    exchangeRate: dbOrder.exchangeRate ? Number(dbOrder.exchangeRate) : 12500,
  };
}

/**
 * Asserts admin permissions or throws
 */
async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Доступ запрещен. Требуются права администратора.");
  }
  return session;
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

    const currentExchangeRate = await getExchangeRate();

    const createdOrder = await prisma.$transaction(async (tx) => {
      let rawItems: Array<{ productId: string; quantity: number }> = [];

      if (userId) {
        // Для авторизованного пользователя состав корзины берётся ИСКЛЮЧИТЕЛЬНО из БД (Zero-Trust)
        const userCart = await tx.cart.findUnique({
          where: { userId },
          include: { items: true },
        });

        if (!userCart || userCart.items.length === 0) {
          throw new Error(
            "Ваша корзина пуста. Добавьте товары перед оформлением заказа."
          );
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
        throw new Error(
          "В заказе должен быть хотя бы один товар с корректным количеством."
        );
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

      // Получаем актуальные настройки тарифов доставки из SystemSetting
      const shopSettings = await getShopSettings();
      const isFreeDelivery =
        deliveryMethod === "pickup" ||
        goodsTotal >= shopSettings.freeDeliveryThresholdUzs;
      const deliveryCost = isFreeDelivery ? 0 : shopSettings.deliveryCostUzs;
      const totalAmount = goodsTotal + deliveryCost;

      // 5. Создание записи заказа Order и позиций OrderItem с фиксацией валюты и курса
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
          currency: "UZS",
          exchangeRate: currentExchangeRate,
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

      const notificationItems: TelegramOrderItem[] = targetItems.map((item) => {
        const product = productMap.get(item.productId)!;
        return {
          productName: product.name,
          price: Number(product.price),
          quantity: item.quantity,
        };
      });

      return {
        orderData: {
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
          currency: order.currency,
          exchangeRate: Number(order.exchangeRate),
        },
        notificationPayload: {
          orderNumber,
          createdAt: order.createdAt,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          deliveryMethod: order.deliveryMethod,
          city: order.city,
          street: order.street,
          house: order.house,
          apartment: order.apartment,
          comment: order.comment,
          items: notificationItems,
          goodsTotal,
          deliveryCost,
          totalAmount,
          currency: order.currency,
          exchangeRate: Number(order.exchangeRate),
        },
      };
    });

    try {
      revalidatePath("/account");
    } catch {
      // Игнорируем ошибки revalidatePath при выполнении вне контекста HTTP-запроса Next.js
    }

    // Асинхронная отправка уведомления в Telegram (Fire-and-forget)
    // Выполняется строго ПОСЛЕ успешного завершения транзакции в БД и не блокирует ответ клиенту
    sendOrderTelegramNotification(createdOrder.notificationPayload).catch(
      (err) => {
        console.error("Telegram notification error:", err);
      }
    );

    return {
      success: true,
      data: createdOrder.orderData,
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

/**
 * Returns orders for the currently authenticated user.
 */
export async function getUserOrders(): Promise<ActionResponse<Order[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Необходима авторизация для просмотра заказов.",
      };
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                image: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: orders.map(formatOrderResponse),
    };
  } catch (error: unknown) {
    console.error("Get user orders error:", error);
    return {
      success: false,
      error: "Не удалось загрузить историю заказов.",
    };
  }
}

/**
 * Returns order details by ID with strict permission checking.
 * - Customer can view ONLY their own orders (order.userId === session.user.id).
 * - Admin can view any order.
 */
export async function getOrderById(
  orderId: string
): Promise<ActionResponse<Order>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Необходима авторизация для просмотра заказа.",
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                image: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: "Заказ не найден.",
      };
    }

    // Security check: only owner or ADMIN
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return {
        success: false,
        error: "Доступ к чужому заказу запрещен.",
      };
    }

    return {
      success: true,
      data: formatOrderResponse(order),
    };
  } catch (error: unknown) {
    console.error("Get order by id error:", error);
    return {
      success: false,
      error: "Не удалось загрузить данные заказа.",
    };
  }
}

/**
 * Cancels an order.
 * - For CUSTOMER: Can cancel ONLY their own order in status "NEW". Stock is not changed.
 * - For ADMIN: Can cancel order in status "NEW" (no stock change) or "CONFIRMED" (returns stock).
 */
export async function cancelOrder(orderId: string): Promise<ActionResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Необходима авторизация.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Заказ не найден.");
      }

      if (session.user.role !== "ADMIN") {
        // Customer checks
        if (order.userId !== session.user.id) {
          throw new Error("Доступ запрещен. Вы не можете отменить чужой заказ.");
        }

        if (order.status !== "NEW") {
          throw new Error(
            "Отменить можно только заказ со статусом «Новый». Для отмены подтвержденного заказа свяжитесь с поддержкой."
          );
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      } else {
        // Admin checks
        if (order.status === "NEW") {
          await tx.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          });
        } else if (order.status === "CONFIRMED") {
          // Возвращаем списанные остатки на склад
          for (const item of order.items) {
            if (item.productId) {
              await tx.product.updateMany({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }

          await tx.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          });
        } else {
          throw new Error(
            `Нельзя отменить заказ в статусе «${order.status}».`
          );
        }
      }
    });

    try {
      revalidatePath("/account");
      revalidatePath(`/account/orders/${orderId}`);
      revalidatePath("/admin/orders");
    } catch {}

    return { success: true, data: undefined };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Не удалось отменить заказ.";
    console.error("Cancel order error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Returns all orders for Admin panel with optional status filter.
 */
export async function getAdminOrders(
  statusFilter?: OrderStatus
): Promise<ActionResponse<Order[]>> {
  try {
    await assertAdmin();

    const orders = await prisma.order.findMany({
      where: statusFilter ? { status: statusFilter } : {},
      include: {
        items: {
          include: {
            product: {
              select: {
                image: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: orders.map(formatOrderResponse),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Не удалось загрузить заказы.";
    console.error("Get admin orders error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Updates order status (Admin only).
 * State Machine transitions:
 * - NEW -> CONFIRMED (Atomic stock decrement with stock >= quantity check)
 * - NEW -> CANCELLED (No stock change)
 * - CONFIRMED -> COMPLETED (No stock change)
 * - CONFIRMED -> CANCELLED (Atomic stock return / increment)
 * All other transitions are strictly rejected.
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<ActionResponse<void>> {
  try {
    await assertAdmin();

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Заказ не найден.");
      }

      const currentStatus = order.status;

      // 1. NEW -> CONFIRMED (Списание остатков со склада)
      if (currentStatus === "NEW" && nextStatus === "CONFIRMED") {
        for (const item of order.items) {
          if (!item.productId) continue;

          const updateResult = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
              deletedAt: null,
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (updateResult.count === 0) {
            throw new Error(
              `Недостаточно товара «${item.productName}» на складе для подтверждения заказа.`
            );
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
      }
      // 2. NEW -> CANCELLED (Отмена без списания)
      else if (currentStatus === "NEW" && nextStatus === "CANCELLED") {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      }
      // 3. CONFIRMED -> COMPLETED (Выполнение заказа)
      else if (currentStatus === "CONFIRMED" && nextStatus === "COMPLETED") {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED" },
        });
      }
      // 4. CONFIRMED -> CANCELLED (Отмена с возвратом списанных остатков)
      else if (currentStatus === "CONFIRMED" && nextStatus === "CANCELLED") {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.updateMany({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      }
      // Недопустимый переход
      else {
        throw new Error(
          `Недопустимый переход статуса заказа из «${currentStatus}» в «${nextStatus}».`
        );
      }
    });

    try {
      revalidatePath("/admin/orders");
      revalidatePath("/account");
      revalidatePath(`/account/orders/${orderId}`);
    } catch {}

    return { success: true, data: undefined };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось обновить статус заказа.";
    console.error("Update order status error:", error);
    return {
      success: false,
      error: message,
    };
  }
}
