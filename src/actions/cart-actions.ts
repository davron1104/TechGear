"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { CartItem } from "@/types/cart";
import { ProductTranslations } from "@/types/product";
import {
  addToCartSchema,
  updateCartQuantitySchema,
  mergeCartSchema,
} from "@/lib/validations/cart";

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fields?: Record<string, string[]> };

/**
 * Asserts that the current user is authenticated and returns their session.
 */
async function assertAuthenticated() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходима авторизация для выполнения этой операции.");
  }
  return session;
}

/**
 * Internal helper to fetch and serialize current user's DB cart items with fresh product data.
 */
async function fetchUserCartItems(
  userId: string,
  tx: typeof prisma | Parameters<Parameters<typeof prisma.$transaction>[0]>[0] = prisma
): Promise<CartItem[]> {
  const cart = await tx.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!cart) {
    return [];
  }

  // Filter out items where product is soft-deleted
  const validItems = cart.items.filter(
    (item) => item.product && item.product.deletedAt === null
  );

  return validItems.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    price: Number(item.product.price),
    image: item.product.image,
    quantity: item.quantity,
    stock: item.product.stock,
    translations: (item.product.translations as ProductTranslations) ?? null,
  }));
}

/**
 * Gets the current authenticated user's cart items from the database.
 */
export async function getCart(): Promise<ActionResponse<CartItem[]>> {
  try {
    const session = await assertAuthenticated();
    const items = await fetchUserCartItems(session.user.id);
    return { success: true, data: items };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при загрузке корзины.";
    console.error("Get cart error:", error);
    return { success: false, error: message };
  }
}

/**
 * Adds an item to the authenticated user's database cart.
 */
export async function addToCart(data: unknown): Promise<ActionResponse<CartItem[]>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const result = addToCartSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: "Неверные параметры для добавления товара в корзину.",
        fields: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { productId, quantity } = result.data;

    // Verify product exists, is not soft-deleted, and is in stock
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      return {
        success: false,
        error: "Товар не найден или недоступен для покупки.",
      };
    }

    if (product.stock <= 0) {
      return {
        success: false,
        error: "Товар закончился на складе.",
      };
    }

    const updatedItems = await prisma.$transaction(async (tx) => {
      // Find or create cart for user
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      // Check if product is already in cart
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      const currentQty = existingItem?.quantity ?? 0;
      const targetQty = currentQty + quantity;
      const finalQty = Math.min(targetQty, product.stock);

      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        create: {
          cartId: cart.id,
          productId,
          quantity: finalQty,
        },
        update: {
          quantity: finalQty,
        },
      });

      return fetchUserCartItems(userId, tx);
    });

    return { success: true, data: updatedItems };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при добавлении товара в корзину.";
    console.error("Add to cart error:", error);
    return { success: false, error: message };
  }
}

/**
 * Updates the quantity of a specific product in the authenticated user's cart.
 */
export async function updateCartItemQuantity(
  data: unknown
): Promise<ActionResponse<CartItem[]>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const result = updateCartQuantitySchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: "Неверные параметры количества товара.",
        fields: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { productId, quantity } = result.data;

    const updatedItems = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        return [];
      }

      if (quantity <= 0) {
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            productId,
          },
        });
      } else {
        const product = await tx.product.findFirst({
          where: { id: productId, deletedAt: null },
        });

        if (!product || product.stock <= 0) {
          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
              productId,
            },
          });
        } else {
          const finalQty = Math.min(quantity, product.stock);
          await tx.cartItem.upsert({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId,
              },
            },
            create: {
              cartId: cart.id,
              productId,
              quantity: finalQty,
            },
            update: {
              quantity: finalQty,
            },
          });
        }
      }

      return fetchUserCartItems(userId, tx);
    });

    return { success: true, data: updatedItems };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при обновлении количества товара.";
    console.error("Update cart quantity error:", error);
    return { success: false, error: message };
  }
}

/**
 * Removes a product from the authenticated user's database cart.
 */
export async function removeFromCart(
  productId: string
): Promise<ActionResponse<CartItem[]>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    if (!productId || typeof productId !== "string") {
      return { success: false, error: "Некорректный идентификатор товара." };
    }

    const updatedItems = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            productId,
          },
        });
      }

      return fetchUserCartItems(userId, tx);
    });

    return { success: true, data: updatedItems };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при удалении товара из корзины.";
    console.error("Remove from cart error:", error);
    return { success: false, error: message };
  }
}

/**
 * Clears all items in the authenticated user's database cart.
 */
export async function clearServerCart(): Promise<ActionResponse<void>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    });

    return { success: true, data: undefined };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при очистке корзины.";
    console.error("Clear server cart error:", error);
    return { success: false, error: message };
  }
}

/**
 * Merges guest items (from client Zustand store) into the user's database cart upon login/registration.
 * - Runs atomically inside a Prisma transaction.
 * - Matches guest items with DB products.
 * - Uses fresh DB product data (price, stock, deletedAt).
 * - Excludes soft-deleted products.
 * - Caps total quantity to available product stock.
 */
export async function mergeCart(
  guestItemsData: unknown
): Promise<ActionResponse<CartItem[]>> {
  try {
    const session = await assertAuthenticated();
    const userId = session.user.id;

    const result = mergeCartSchema.safeParse(guestItemsData);
    if (!result.success) {
      return {
        success: false,
        error: "Неверный формат гостевых элементов корзины для слияния.",
      };
    }

    const guestItems = result.data;

    // If no guest items to merge, just return current DB cart
    if (guestItems.length === 0) {
      const currentItems = await fetchUserCartItems(userId);
      return { success: true, data: currentItems };
    }

    const mergedItems = await prisma.$transaction(async (tx) => {
      // Find or create cart for user
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      // Get unique product IDs from guest items
      const productIds = Array.from(
        new Set(guestItems.map((item) => item.productId))
      );

      // Fetch active (non-deleted) products from DB
      const dbProducts = await tx.product.findMany({
        where: {
          id: { in: productIds },
          deletedAt: null,
        },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // Fetch existing cart items in DB
      const existingDbCartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });

      const dbCartItemMap = new Map(
        existingDbCartItems.map((item) => [item.productId, item.quantity])
      );

      // Merge guest items into DB cart items
      for (const guestItem of guestItems) {
        const product = productMap.get(guestItem.productId);
        // Skip if product does not exist, is soft-deleted, or out of stock
        if (!product || product.stock <= 0) {
          continue;
        }

        const existingQty = dbCartItemMap.get(guestItem.productId) ?? 0;
        const totalQty = existingQty + guestItem.quantity;
        const cappedQty = Math.min(totalQty, product.stock);

        await tx.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: guestItem.productId,
            },
          },
          create: {
            cartId: cart.id,
            productId: guestItem.productId,
            quantity: cappedQty,
          },
          update: {
            quantity: cappedQty,
          },
        });

        // Update local map in case guestItems has duplicates
        dbCartItemMap.set(guestItem.productId, cappedQty);
      }

      return fetchUserCartItems(userId, tx);
    });

    return { success: true, data: mergedItems };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при объединении корзин.";
    console.error("Merge cart error:", error);
    return { success: false, error: message };
  }
}
