"use server";

import path from "path";
import { auth } from "@/auth";
import { uploadImageToB2 } from "@/lib/b2";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type UploadResponse =
  | { success: true; url: string; key?: string }
  | { success: false; error: string };

async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Доступ запрещён. Требуются права администратора.");
  }
  return session;
}

/**
 * Server action to securely upload a product image directly to Backblaze B2.
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

    // 2. Validate file extension
    const extension = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      return {
        success: false,
        error: `Недопустимое расширение файла (${extension || "отсутствует"}). Разрешены: .jpg, .jpeg, .png, .webp, .gif.`,
      };
    }

    // 3. Validate file size (max 5 MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        success: false,
        error: `Размер файла (${(file.size / (1024 * 1024)).toFixed(1)} МБ) превышает допустимый лимит 5 МБ.`,
      };
    }

    // 4. Convert File to Buffer in memory
    let buffer: Buffer;
    if (typeof file.arrayBuffer === "function") {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const text = await file.text();
      buffer = Buffer.from(text);
    }

    // 5. Stream directly to Backblaze B2 S3 storage (no local file is written)
    const result = await uploadImageToB2(buffer, file.name, file.type);

    return {
      success: true,
      url: result.url,
      key: result.key,
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
