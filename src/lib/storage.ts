import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/**
 * Saves an image Buffer to the local public/uploads/products/ directory.
 * Returns the public relative URL (e.g. "/uploads/products/prod_1724458923_a1b2c3d4.webp").
 */
export async function saveImageLocally(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

  // Ensure target directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  // Determine file extension
  let ext = MIME_EXTENSION_MAP[mimeType];
  if (!ext) {
    ext = path.extname(originalFilename).toLowerCase() || ".png";
  }

  // Generate a collision-free filename
  const uniqueId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const fileName = `prod_${Date.now()}_${uniqueId}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  // Write file to public directory
  await fs.writeFile(filePath, buffer);

  return `/uploads/products/${fileName}`;
}

/**
 * Safely removes a local product image file if it exists in public/uploads/products.
 */
export async function deleteImageLocally(relativeUrl: string): Promise<void> {
  if (!relativeUrl || !relativeUrl.startsWith("/uploads/products/")) {
    return;
  }

  try {
    const filename = path.basename(relativeUrl);
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      filename
    );

    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist (ENOENT)
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      console.error("Local file deletion error:", error);
    }
  }
}
