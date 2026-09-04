import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadProductImage } from "@/actions/upload-actions";
import { uploadImageToB2 } from "@/lib/b2";
import { auth } from "@/auth";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock B2 helper
vi.mock("@/lib/b2", () => ({
  uploadImageToB2: vi.fn(),
}));

function createMockFile(content: string | Uint8Array, name: string, type: string): File {
  const file = new File([content as BlobPart], name, { type });
  const buf = typeof content === "string" ? Buffer.from(content) : Buffer.from(content);
  file.arrayBuffer = () => Promise.resolve(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  file.text = () => Promise.resolve(typeof content === "string" ? content : buf.toString("utf8"));
  return file;
}

describe("uploadProductImage Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated request", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const formData = new FormData();
    formData.append("file", createMockFile("test", "test.png", "image/png"));

    const res = await uploadProductImage(formData);

    expect(res).toEqual({
      success: false,
      error: "Доступ запрещён. Требуются права администратора.",
    });
    expect(uploadImageToB2).not.toHaveBeenCalled();
  });

  it("should reject non-admin (CUSTOMER) request", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "user@test.com", role: "CUSTOMER" },
      expires: "2099-01-01",
    } as any);

    const formData = new FormData();
    formData.append("file", createMockFile("test", "test.png", "image/png"));

    const res = await uploadProductImage(formData);

    expect(res).toEqual({
      success: false,
      error: "Доступ запрещён. Требуются права администратора.",
    });
    expect(uploadImageToB2).not.toHaveBeenCalled();
  });

  it("should reject invalid MIME type", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
      expires: "2099-01-01",
    } as any);

    const formData = new FormData();
    formData.append(
      "file",
      createMockFile("%PDF-1.5", "document.pdf", "application/pdf")
    );

    const res = await uploadProductImage(formData);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("Недопустимый формат файла");
    }
    expect(uploadImageToB2).not.toHaveBeenCalled();
  });

  it("should reject invalid file extension even with valid MIME", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
      expires: "2099-01-01",
    } as any);

    const formData = new FormData();
    formData.append(
      "file",
      createMockFile("code", "script.exe", "image/png")
    );

    const res = await uploadProductImage(formData);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("Недопустимое расширение файла");
    }
    expect(uploadImageToB2).not.toHaveBeenCalled();
  });

  it("should reject file exceeding 5 MB", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
      expires: "2099-01-01",
    } as any);

    // 6 MB file
    const largeContent = new Uint8Array(6 * 1024 * 1024);
    const formData = new FormData();
    formData.append(
      "file",
      createMockFile(largeContent, "huge.png", "image/png")
    );

    const res = await uploadProductImage(formData);

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toContain("превышает допустимый лимит 5 МБ");
    }
    expect(uploadImageToB2).not.toHaveBeenCalled();
  });

  it("should handle missing file gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
      expires: "2099-01-01",
    } as any);

    const formData = new FormData();
    const res = await uploadProductImage(formData);

    expect(res).toEqual({
      success: false,
      error: "Файл изображения не передан или повреждён.",
    });
  });

  it("should successfully upload valid file to Backblaze B2 for ADMIN", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(uploadImageToB2).mockResolvedValue({
      url: "https://s3.eu-central-003.backblazeb2.com/techgear-products/products/prod_123.webp",
      key: "products/prod_123.webp",
    });

    const formData = new FormData();
    formData.append(
      "file",
      createMockFile("image-bytes", "keyboard.webp", "image/webp")
    );

    const res = await uploadProductImage(formData);

    expect(uploadImageToB2).toHaveBeenCalledWith(
      expect.any(Buffer),
      "keyboard.webp",
      "image/webp"
    );

    expect(res).toEqual({
      success: true,
      url: "https://s3.eu-central-003.backblazeb2.com/techgear-products/products/prod_123.webp",
      key: "products/prod_123.webp",
    });
  });

  it("should handle B2 configuration error gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", email: "admin@test.com", role: "ADMIN" },
      expires: "2099-01-01",
    } as any);

    vi.mocked(uploadImageToB2).mockRejectedValue(
      new Error("Backblaze B2 credentials not configured")
    );

    const formData = new FormData();
    formData.append(
      "file",
      createMockFile("image-bytes", "mouse.jpg", "image/jpeg")
    );

    const res = await uploadProductImage(formData);

    expect(res).toEqual({
      success: false,
      error: "Backblaze B2 credentials not configured",
    });
  });
});
