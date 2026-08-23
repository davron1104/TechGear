"use server";

import { auth } from "@/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  saveImageLocally,
} from "@/lib/storage";

export type UploadResponse =
  | { success: true; url: string }
  | { success: false; error: string };

async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Доступ запрещён. Требуются права администратора.");
  }
  return session;
}

/**
 * Server action to upload a product image to local public/uploads/products/ storage.
 */
export async function uploadProductImage(formData: FormData): Promise<UploadResponse> {
  try {
    await assertAdmin();

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: "Файл изображения не передан или повреждён.",
      };
    }

    // 1. Validate MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `Недопустимый формат файла (${file.type || "неизвестный"}). Поддерживаются форматы: JPEG, PNG, WebP, GIF.`,
      };
    }

    // 2. Validate file size (max 5 MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        success: false,
        error: `Размер файла (${(file.size / (1024 * 1024)).toFixed(1)} МБ) превышает допустимый лимит 5 МБ.`,
      };
    }

    // 3. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Save to local storage
    const relativeUrl = await saveImageLocally(buffer, file.name, file.type);

    return {
      success: true,
      url: relativeUrl,
    };
  } catch (error: unknown) {
    let message = "Системная ошибка при сохранении изображения.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "object" && error !== null && "message" in error) {
      message = String((error as { message: unknown }).message);
    }
    console.error("Upload image error:", error);
    return {
      success: false,
      error: message,
    };
  }
}
