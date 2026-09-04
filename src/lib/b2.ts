import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

export interface B2UploadResult {
  url: string;
  key: string;
}

function getB2Credentials() {
  const keyId =
    process.env.B2_KEY_ID ||
    process.env.B2_APPLICATION_KEY_ID ||
    process.env.BACKBLAZE_KEY_ID ||
    process.env.BACKBLAZE_APPLICATION_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID;

  const appKey =
    process.env.B2_APPLICATION_KEY ||
    process.env.B2_APP_KEY ||
    process.env.BACKBLAZE_APPLICATION_KEY ||
    process.env.BACKBLAZE_APP_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY;

  const bucketName =
    process.env.B2_BUCKET_NAME ||
    process.env.BACKBLAZE_BUCKET_NAME ||
    "techgear-products";

  const rawEndpoint =
    process.env.B2_ENDPOINT ||
    process.env.BACKBLAZE_ENDPOINT ||
    "https://s3.eu-central-003.backblazeb2.com";

  const region =
    process.env.B2_REGION ||
    process.env.BACKBLAZE_REGION ||
    "eu-central-003";

  return { keyId, appKey, bucketName, rawEndpoint, region };
}

/**
 * Returns true if Backblaze B2 credentials are present.
 */
export function isB2Configured(): boolean {
  const { keyId, appKey } = getB2Credentials();
  return Boolean(keyId && appKey);
}

/**
 * Creates and returns an S3Client instance configured for Backblaze B2 S3-compatible API.
 */
export function getB2Client(): S3Client {
  const { keyId, appKey, rawEndpoint, region } = getB2Credentials();

  if (!keyId || !appKey) {
    throw new Error("Backblaze B2 credentials not configured");
  }

  // Ensure endpoint starts with https://
  const endpoint = rawEndpoint.startsWith("http")
    ? rawEndpoint
    : `https://${rawEndpoint}`;

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: appKey,
    },
  });
}

/**
 * Uploads an image Buffer to Backblaze B2 object storage.
 *
 * @param buffer - File content as a Node.js Buffer
 * @param originalFilename - Original filename for extension deduction
 * @param mimeType - Image MIME type (e.g. "image/webp")
 * @returns Promise resolving to public URL and object key
 */
export async function uploadImageToB2(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<B2UploadResult> {
  const { bucketName, rawEndpoint } = getB2Credentials();
  const endpoint = rawEndpoint.startsWith("http")
    ? rawEndpoint.replace(/\/$/, "")
    : `https://${rawEndpoint.replace(/\/$/, "")}`;

  const client = getB2Client();

  // Deduce file extension
  const ext = path.extname(originalFilename || "").toLowerCase() || ".jpg";
  const uniqueId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const key = `products/prod_${Date.now()}_${uniqueId}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await client.send(command);

  // Build canonical S3/B2 URL: https://<endpoint>/<bucketName>/<key>
  const url = `${endpoint}/${bucketName}/${key}`;

  return {
    url,
    key,
  };
}
