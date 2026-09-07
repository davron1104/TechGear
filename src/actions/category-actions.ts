"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";
import { revalidatePath } from "next/cache";

/**
 * Asserts that the current session belongs to an ADMIN user.
 * Returns the session or throws an error.
 */
async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Доступ запрещен. Требуются права администратора.");
  }
  return session;
}

/**
 * Creates a new category.
 */
export async function createCategory(data: unknown) {
  try {
    await assertAdmin();

    const result = categorySchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: "Неверные данные категории.",
        fields: result.error.flatten().fieldErrors,
      };
    }

    const { name, slug } = result.data;
    const formattedSlug = slug.toLowerCase().trim();

    // Check slug uniqueness
    const existingCategory = await prisma.category.findUnique({
      where: { slug: formattedSlug },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Категория с таким слагом уже существует.",
        fields: { slug: ["Этот слаг уже занят"] },
      };
    }

    await prisma.category.create({
      data: {
        name: name.trim(),
        slug: formattedSlug,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: unknown) {
    console.error("Create category error:", error);
    const message = error instanceof Error ? error.message : "Произошла системная ошибка при создании категории.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Updates an existing category.
 */
export async function updateCategory(id: string, data: unknown) {
  try {
    await assertAdmin();

    const result = categorySchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: "Неверные данные категории.",
        fields: result.error.flatten().fieldErrors,
      };
    }

    const { name, slug } = result.data;
    const formattedSlug = slug.toLowerCase().trim();

    // Check slug uniqueness (excluding this category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: formattedSlug,
        id: { not: id },
      },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Категория с таким слагом уже существует.",
        fields: { slug: ["Этот слаг уже занят"] },
      };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: formattedSlug,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: unknown) {
    console.error("Update category error:", error);
    const message = error instanceof Error ? error.message : "Произошла системная ошибка при обновлении категории.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Deletes a category.
 * Prevents deletion if any products are associated with it.
 */
export async function deleteCategory(id: string) {
  try {
    await assertAdmin();

    // Validate that category contains no products (including soft-deleted)
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return {
        success: false,
        error: `Нельзя удалить категорию, так как с ней связано ${productsCount} товар(ов).`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: unknown) {
    console.error("Delete category error:", error);
    const message = error instanceof Error ? error.message : "Произошла системная ошибка при удалении категории.";
    return {
      success: false,
      error: message,
    };
  }
}
