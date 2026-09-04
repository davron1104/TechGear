import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { isB2Configured, getB2Client, uploadImageToB2 } from "@/lib/b2";

const mockSend = vi.fn();

// Mock @aws-sdk/client-s3 with constructible class functions
vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: vi.fn().mockImplementation(function (this: any) {
      this.send = mockSend;
      return this;
    }),
    PutObjectCommand: vi.fn().mockImplementation(function (this: any, args: any) {
      Object.assign(this, args);
      return this;
    }),
  };
});

describe("Backblaze B2 Service (src/lib/b2.ts)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    process.env = { ...originalEnv };
    delete process.env.B2_KEY_ID;
    delete process.env.B2_APPLICATION_KEY_ID;
    delete process.env.B2_APPLICATION_KEY;
    delete process.env.B2_APP_KEY;
    delete process.env.B2_BUCKET_NAME;
    delete process.env.B2_ENDPOINT;
    delete process.env.B2_REGION;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isB2Configured", () => {
    it("should return false when credentials or bucket are missing", () => {
      expect(isB2Configured()).toBe(false);
    });

    it("should return true when B2_KEY_ID, B2_APPLICATION_KEY and B2_BUCKET_NAME are present", () => {
      process.env.B2_KEY_ID = "test-key-id";
      process.env.B2_APPLICATION_KEY = "test-app-key";
      process.env.B2_BUCKET_NAME = "techgear-products";

      expect(isB2Configured()).toBe(true);
    });

    it("should support alternative env var names (B2_APPLICATION_KEY_ID, B2_APP_KEY)", () => {
      process.env.B2_APPLICATION_KEY_ID = "test-key-id";
      process.env.B2_APP_KEY = "test-app-key";
      process.env.B2_BUCKET_NAME = "techgear-products";

      expect(isB2Configured()).toBe(true);
    });
  });

  describe("getB2Client", () => {
    it("should throw controlled error if credentials are not configured", () => {
      expect(() => getB2Client()).toThrow("Backblaze B2 credentials not configured");
    });

    it("should instantiate S3Client with correct endpoint and credentials", () => {
      process.env.B2_KEY_ID = "key-123";
      process.env.B2_APPLICATION_KEY = "secret-456";
      process.env.B2_ENDPOINT = "https://s3.eu-central-003.backblazeb2.com";
      process.env.B2_REGION = "eu-central-003";

      getB2Client();

      expect(S3Client).toHaveBeenCalledWith({
        endpoint: "https://s3.eu-central-003.backblazeb2.com",
        region: "eu-central-003",
        credentials: {
          accessKeyId: "key-123",
          secretAccessKey: "secret-456",
        },
      });
    });
  });

  describe("uploadImageToB2", () => {
    it("should send PutObjectCommand to B2 and return correct public URL and key", async () => {
      process.env.B2_KEY_ID = "key-123";
      process.env.B2_APPLICATION_KEY = "secret-456";
      process.env.B2_BUCKET_NAME = "techgear-products";
      process.env.B2_ENDPOINT = "https://s3.eu-central-003.backblazeb2.com";
      process.env.B2_REGION = "eu-central-003";

      mockSend.mockResolvedValueOnce({});

      const buffer = Buffer.from("fake-image-bytes");
      const result = await uploadImageToB2(buffer, "keyboard.webp", "image/webp");

      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: "techgear-products",
        Key: expect.stringMatching(/^products\/prod_\d+_[a-f0-9]+\.webp$/),
        Body: buffer,
        ContentType: "image/webp",
      });

      expect(mockSend).toHaveBeenCalled();
      expect(result.key).toMatch(/^products\/prod_\d+_[a-f0-9]+\.webp$/);
      expect(result.url).toBe(
        `https://s3.eu-central-003.backblazeb2.com/techgear-products/${result.key}`
      );
    });

    it("should throw if S3 PutObjectCommand fails", async () => {
      process.env.B2_KEY_ID = "key-123";
      process.env.B2_APPLICATION_KEY = "secret-456";
      process.env.B2_BUCKET_NAME = "techgear-products";

      mockSend.mockRejectedValueOnce(new Error("S3 Network Error"));

      const buffer = Buffer.from("fake-bytes");
      await expect(
        uploadImageToB2(buffer, "mouse.png", "image/png")
      ).rejects.toThrow("S3 Network Error");
    });
  });
});
