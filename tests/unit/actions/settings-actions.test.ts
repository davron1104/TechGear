import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getAdminShopSettings,
  updateShopSettings,
} from "@/actions/settings-actions";
import { DEFAULT_SHOP_SETTINGS } from "@/lib/settings";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    systemSetting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Settings Server Actions - Shop Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminShopSettings", () => {
    it("should reject unauthenticated request", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await getAdminShopSettings();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Доступ запрещен");
      }
    });

    it("should reject customer role request", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "u-1", email: "user@techgear.uz", role: "CUSTOMER" },
        expires: "2099-01-01",
      });

      const result = await getAdminShopSettings();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Доступ запрещен");
      }
    });

    it("should allow admin role and return shop settings", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "a-1", email: "admin@techgear.uz", role: "ADMIN" },
        expires: "2099-01-01",
      });
      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([]);

      const result = await getAdminShopSettings();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(DEFAULT_SHOP_SETTINGS);
      }
    });
  });

  describe("updateShopSettings", () => {
    it("should reject unauthenticated user", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await updateShopSettings({
        phone: "+998 90 000 00 00",
        email: "test@techgear.uz",
        address: "Адрес",
        workingHours: "09:00 - 18:00",
        deliveryCostUzs: 30000,
        freeDeliveryThresholdUzs: 500000,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Доступ запрещен");
      }
    });

    it("should reject non-admin user", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "c-1", email: "customer@techgear.uz", role: "CUSTOMER" },
        expires: "2099-01-01",
      });

      const result = await updateShopSettings({
        phone: "+998 90 000 00 00",
        email: "test@techgear.uz",
        address: "Адрес",
        workingHours: "09:00 - 18:00",
        deliveryCostUzs: 30000,
        freeDeliveryThresholdUzs: 500000,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Доступ запрещен");
      }
    });

    it("should reject invalid validation data", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "a-1", email: "admin@techgear.uz", role: "ADMIN" },
        expires: "2099-01-01",
      });

      const result = await updateShopSettings({
        phone: "123", // too short
        email: "invalid-email",
        address: "",
        workingHours: "",
        deliveryCostUzs: -10,
        freeDeliveryThresholdUzs: -50,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Ошибка валидации");
        expect(result.fields).toBeDefined();
      }
    });

    it("should update settings successfully when admin passes valid data", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "a-1", email: "admin@techgear.uz", role: "ADMIN" },
        expires: "2099-01-01",
      });
      vi.mocked(prisma.$transaction).mockResolvedValueOnce([{}, {}, {}, {}, {}, {}]);

      const payload = {
        phone: "+998 71 200 00 00",
        email: "admin@techgear.uz",
        address: "г. Ташкент, пр-т Амира Темура, 50",
        workingHours: "Пн–Сб: 10:00 – 20:00",
        deliveryCostUzs: 35000,
        freeDeliveryThresholdUzs: 600000,
      };

      const result = await updateShopSettings(payload);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(payload);
      }
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
