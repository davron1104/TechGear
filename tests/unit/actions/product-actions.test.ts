import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/product-actions";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    product: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    orderItem: {
      count: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Product Server Actions (product-actions)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validAdminSession = {
    user: { id: "admin-1", email: "admin@techgear.uz", role: "ADMIN" },
    expires: "2099-01-01",
  };

  const validCustomerSession = {
    user: { id: "customer-1", email: "customer@techgear.uz", role: "CUSTOMER" },
    expires: "2099-01-01",
  };

  const sampleProductData = {
    name: "Игровая мышь TechGear CyberPulse Pro",
    slug: "techgear-cyberpulse-pro",
    categoryId: "cat-1",
    price: 450000,
    brand: "TechGear",
    stock: 20,
    image: "/uploads/products/mouse.jpg",
    images: ["/uploads/products/mouse.jpg"],
    shortDescription: "Беспроводная мышь с оптическим сенсором 26000 DPI.",
    description: "Профессиональная мышь для киберспорта.",
    characteristics: {
      "Сенсор": "PixArt PAW3395",
    },
    isPopular: true,
  };

  describe("assertAdmin authorization", () => {
    it("should reject unauthenticated createProduct call", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await createProduct(sampleProductData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Требуются права администратора");
      }
    });

    it("should reject customer role createProduct call", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validCustomerSession);

      const result = await createProduct(sampleProductData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Требуются права администратора");
      }
    });

    it("should reject unauthenticated updateProduct call", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await updateProduct("prod-1", sampleProductData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Требуются права администратора");
      }
    });
  });

  describe("createProduct with translations", () => {
    it("should create product with sanitized translations", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validAdminSession);
      (prisma.product.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
      (prisma.category.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "cat-1",
        name: "Мыши",
        slug: "mice",
      });
      (prisma.product.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "new-prod-1",
      });

      const payload = {
        ...sampleProductData,
        translations: {
          uz: {
            name: "TechGear CyberPulse Pro Sichqonchasi",
            shortDescription: "Optik sensorli simsiz sichqoncha.",
            description: "Kibersport uchun sichqoncha.",
            characteristics: {
              "Sensor": "PixArt PAW3395",
            },
          },
          en: {
            name: "TechGear CyberPulse Pro Mouse",
            shortDescription: "Wireless mouse with optical sensor.",
            description: "Professional gaming mouse.",
            characteristics: {
              "Sensor": "PixArt PAW3395",
            },
          },
        },
      };

      const result = await createProduct(payload);
      expect(result.success).toBe(true);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Игровая мышь TechGear CyberPulse Pro",
          slug: "techgear-cyberpulse-pro",
          translations: {
            uz: {
              name: "TechGear CyberPulse Pro Sichqonchasi",
              shortDescription: "Optik sensorli simsiz sichqoncha.",
              description: "Kibersport uchun sichqoncha.",
              characteristics: {
                Sensor: "PixArt PAW3395",
              },
            },
            en: {
              name: "TechGear CyberPulse Pro Mouse",
              shortDescription: "Wireless mouse with optical sensor.",
              description: "Professional gaming mouse.",
              characteristics: {
                Sensor: "PixArt PAW3395",
              },
            },
          },
        }),
      });
    });

    it("should create product without translations when none provided or empty", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validAdminSession);
      (prisma.product.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
      (prisma.category.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "cat-1",
        name: "Мыши",
        slug: "mice",
      });
      (prisma.product.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "new-prod-2",
      });

      const payload = {
        ...sampleProductData,
        translations: {
          uz: { name: "   ", shortDescription: "", description: "   " },
          en: { name: "" },
        },
      };

      const result = await createProduct(payload);
      expect(result.success).toBe(true);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Игровая мышь TechGear CyberPulse Pro",
          translations: undefined,
        }),
      });
    });
  });

  describe("updateProduct with translations", () => {
    it("should update product and apply changed translations", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validAdminSession);
      (prisma.product.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
      (prisma.category.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "cat-1",
        name: "Мыши",
        slug: "mice",
      });
      (prisma.product.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "prod-1",
      });

      const payload = {
        ...sampleProductData,
        translations: {
          uz: {
            name: "Yangi Sichqoncha",
          },
        },
      };

      const result = await updateProduct("prod-1", payload);
      expect(result.success).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: expect.objectContaining({
          translations: {
            uz: {
              name: "Yangi Sichqoncha",
            },
          },
        }),
      });
    });

    it("should set translations to null when explicitly cleared", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validAdminSession);
      (prisma.product.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
      (prisma.category.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "cat-1",
        name: "Мыши",
        slug: "mice",
      });
      (prisma.product.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "prod-1",
      });

      const payload = {
        ...sampleProductData,
        translations: null,
      };

      const result = await updateProduct("prod-1", payload);
      expect(result.success).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: expect.objectContaining({
          translations: null,
        }),
      });
    });

    it("should not overwrite translations if translations field is omitted (undefined)", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validAdminSession);
      (prisma.product.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
      (prisma.category.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "cat-1",
        name: "Мыши",
        slug: "mice",
      });
      (prisma.product.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "prod-1",
      });

      const payload = { ...sampleProductData };

      const result = await updateProduct("prod-1", payload);
      expect(result.success).toBe(true);
      const updateCallArg = (prisma.product.update as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(updateCallArg.data).not.toHaveProperty("translations");
    });
  });

  describe("deleteProduct", () => {
    it("should soft delete if product has order items", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validAdminSession);
      (prisma.orderItem.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(3);
      (prisma.product.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "prod-1",
      });

      const result = await deleteProduct("prod-1");
      expect(result.success).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { deletedAt: expect.any(Date) },
      });
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it("should physically delete if product has no order history", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(validAdminSession);
      (prisma.orderItem.count as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(0);
      (prisma.product.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        id: "prod-1",
      });

      const result = await deleteProduct("prod-1");
      expect(result.success).toBe(true);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: "prod-1" },
      });
    });
  });
});
