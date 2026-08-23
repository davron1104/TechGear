import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary if CLOUDINARY_URL is present in environment
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_URL);
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

/**
 * Uploads an image Buffer to Cloudinary inside the specified folder.
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string = "techgear/products"
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Сервис Cloudinary не настроен. Проверьте переменную CLOUDINARY_URL в .env"
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error("Не удалось загрузить изображение в Cloudinary"));
        } else {
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary by its publicId.
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured() || !publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
}
