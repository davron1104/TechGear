"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";
import { ProductTranslations, ProductTranslationData } from "@/types/product";
import type { Prisma } from "@/generated/prisma/client";

type ActionSuccess = { success: true };
type ActionError = {
  success: false;
  error: string;
  fields?: Record<string, string[]>;
};
type ActionResponse = ActionSuccess | ActionError;

/**
 * Cleans translation fields, stripping empty strings and empty objects.
 */
function cleanTranslationData(
  data?: ProductTranslationData | null
): ProductTranslationData | undefined {
  if (!data) return undefined;

  const trimmedName = data.name?.trim();
  const trimmedShortDesc = data.shortDescription?.trim();
  const trimmedDesc = data.description?.trim();

  const cleanCharacteristics: Record<string, string> = {};
  if (data.characteristics) {
    for (const [key, value] of Object.entries(data.characteristics)) {
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      if (trimmedKey) {
        cleanCharacteristics[trimmedKey] = trimmedValue;
      }
    }
  }

  const hasChars = Object.keys(cleanCharacteristics).length > 0;
  const hasName = Boolean(trimmedName);
  const hasShortDesc = Boolean(trimmedShortDesc);
  const hasDesc = Boolean(trimmedDesc);

  if (!hasName && !hasShortDesc && !hasDesc && !hasChars) {
    return undefined;
  }

  const result: ProductTranslationData = {};
  if (hasName) result.name = trimmedName;
  if (hasShortDesc) result.shortDescription = trimmedShortDesc;
  if (hasDesc) result.description = trimmedDesc;
  if (hasChars) result.characteristics = cleanCharacteristics;

  return result;
}

/**
 * Sanitizes the entire ProductTranslations structure.
 */
function cleanTranslations(
  translations?: ProductTranslations | null
): ProductTranslations | null {
  if (!translations) return null;

  const uz = cleanTranslationData(translations.uz);
  const en = cleanTranslationData(translations.en);

  if (!uz && !en) {
    return null;
  }

  const result: ProductTranslations = {};
  if (uz) result.uz = uz;
  if (en) result.en = en;

  return result;
}

/**
 * Asserts that the current session belongs to an ADMIN user.
 */
async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Доступ запрещён. Требуются права администратора.");
  }
  return session;
}

/**
 * Creates a new product.
 */
export async function createProduct(data: unknown): Promise<ActionResponse> {
  try {
    await assertAdmin();

    const result = productSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: "Неверные данные товара.",
        fields: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const {
      name,
      slug,
      categoryId,
      price,
      brand,
      stock,
      image,
      images,
      shortDescription,
      description,
      characteristics,
      translations,
      isPopular,
    } = result.data;
    const formattedSlug = slug.toLowerCase().trim();
    const trimmedMainImage = image.trim();
    const rawAdditional = images || [];
    const uniqueAdditional = rawAdditional
      .map((img) => img.trim())
      .filter((img) => img.length > 0 && img !== trimmedMainImage);
    const finalImages = [trimmedMainImage, ...Array.from(new Set(uniqueAdditional)).slice(0, 5)];

    // Check slug uniqueness
    const existingBySlug = await prisma.product.findUnique({
      where: { slug: formattedSlug },
    });
    if (existingBySlug) {
      return {
        success: false,
        error: "Товар с таким слагом уже существует.",
        fields: { slug: ["Этот слаг уже занят"] },
      };
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return {
        success: false,
        error: "Указанная категория не найдена.",
        fields: { categoryId: ["Категория не найдена"] },
      };
    }

    const finalTranslations = cleanTranslations(translations as ProductTranslations);

    await prisma.product.create({
      data: {
        name: name.trim(),
        slug: formattedSlug,
        categoryId,
        price,
        brand: brand.trim(),
        stock,
        image: trimmedMainImage,
        images: finalImages,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        characteristics: characteristics as Prisma.InputJsonValue,
        translations: (finalTranslations ?? undefined) as Prisma.InputJsonValue | undefined,
        isPopular: Boolean(isPopular),
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при создании товара.";
    console.error("Create product error:", error);
    return { success: false, error: message };
  }
}

/**
 * Updates an existing product.
 */
export async function updateProduct(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    await assertAdmin();

    const result = productSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: "Неверные данные товара.",
        fields: result.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const {
      name,
      slug,
      categoryId,
      price,
      brand,
      stock,
      image,
      images,
      shortDescription,
      description,
      characteristics,
      translations,
      isPopular,
    } = result.data;
    const formattedSlug = slug.toLowerCase().trim();
    const trimmedMainImage = image.trim();
    const rawAdditional = images || [];
    const uniqueAdditional = rawAdditional
      .map((img) => img.trim())
      .filter((img) => img.length > 0 && img !== trimmedMainImage);
    const finalImages = [trimmedMainImage, ...Array.from(new Set(uniqueAdditional)).slice(0, 5)];

    // Check slug uniqueness (excluding current product)
    const existingBySlug = await prisma.product.findFirst({
      where: { slug: formattedSlug, id: { not: id } },
    });
    if (existingBySlug) {
      return {
        success: false,
        error: "Товар с таким слагом уже существует.",
        fields: { slug: ["Этот слаг уже занят"] },
      };
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return {
        success: false,
        error: "Указанная категория не найдена.",
        fields: { categoryId: ["Категория не найдена"] },
      };
    }

    const updateData: Prisma.ProductUncheckedUpdateInput = {
      name: name.trim(),
      slug: formattedSlug,
      categoryId,
      price,
      brand: brand.trim(),
      stock,
      image: trimmedMainImage,
      images: finalImages,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      characteristics: characteristics as Prisma.InputJsonValue,
      isPopular: Boolean(isPopular),
    };

    if (translations !== undefined) {
      updateData.translations = (cleanTranslations(translations as ProductTranslations) ?? null) as
        | Prisma.InputJsonValue
        | Prisma.NullableJsonNullValueInput;
    }

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при обновлении товара.";
    console.error("Update product error:", error);
    return { success: false, error: message };
  }
}

/**
 * Deletes a product.
 *
 * Per backend-rules.md Soft Delete policy:
 * - If the product has OrderItem history → set deletedAt (soft delete, keeps order integrity).
 * - If no order history → physical delete.
 */
export async function deleteProduct(id: string): Promise<ActionResponse> {
  try {
    await assertAdmin();

    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      // Soft delete: product is referenced in orders — only hide it
      await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      // Physical delete: no order history
      await prisma.product.delete({ where: { id } });
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Системная ошибка при удалении товара.";
    console.error("Delete product error:", error);
    return { success: false, error: message };
  }
}
