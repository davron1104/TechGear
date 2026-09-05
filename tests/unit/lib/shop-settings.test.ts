import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getShopSettings } from "@/lib/settings-server";
import {
  DEFAULT_SHOP_SETTINGS,
  SHOP_PHONE_KEY,
  SHOP_EMAIL_KEY,
  SHOP_ADDRESS_KEY,
  SHOP_WORKING_HOURS_KEY,
  DELIVERY_COST_UZS_KEY,
  FREE_DELIVERY_THRESHOLD_UZS_KEY,
  STICKY_TOP_BAR_KEY,
} from "@/lib/settings";
import { updateShopSettingsSchema } from "@/lib/validations/settings";

vi.mock("@/lib/prisma", () => ({
  default: {
    systemSetting: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("Shop Settings Service & Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getShopSettings", () => {
    it("should return DEFAULT_SHOP_SETTINGS when database returns empty records", async () => {
      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([]);

      const settings = await getShopSettings();

      expect(settings).toEqual(DEFAULT_SHOP_SETTINGS);
      expect(prisma.systemSetting.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return parsed settings from database records", async () => {
      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([
        { key: SHOP_PHONE_KEY, value: "+998 90 123 45 67", updatedAt: new Date() },
        { key: SHOP_EMAIL_KEY, value: "contact@techgear.uz", updatedAt: new Date() },
        { key: SHOP_ADDRESS_KEY, value: "г. Ташкент, Ц-1, 10", updatedAt: new Date() },
        { key: SHOP_WORKING_HOURS_KEY, value: "10:00 - 20:00", updatedAt: new Date() },
        { key: DELIVERY_COST_UZS_KEY, value: "25000", updatedAt: new Date() },
        { key: FREE_DELIVERY_THRESHOLD_UZS_KEY, value: "400000", updatedAt: new Date() },
        { key: STICKY_TOP_BAR_KEY, value: "true", updatedAt: new Date() },
      ]);

      const settings = await getShopSettings();

      expect(settings).toEqual({
        phone: "+998 90 123 45 67",
        email: "contact@techgear.uz",
        address: "г. Ташкент, Ц-1, 10",
        workingHours: "10:00 - 20:00",
        deliveryCostUzs: 25000,
        freeDeliveryThresholdUzs: 400000,
        stickyTopBar: true,
      });
    });

    it("should parse '1' as stickyTopBar true and '0' as false", async () => {
      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([
        { key: STICKY_TOP_BAR_KEY, value: "1", updatedAt: new Date() },
      ]);

      const settings1 = await getShopSettings();
      expect(settings1.stickyTopBar).toBe(true);

      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([
        { key: STICKY_TOP_BAR_KEY, value: "0", updatedAt: new Date() },
      ]);

      const settings0 = await getShopSettings();
      expect(settings0.stickyTopBar).toBe(false);
    });

    it("should fallback safely on database exception", async () => {
      vi.mocked(prisma.systemSetting.findMany).mockRejectedValueOnce(
        new Error("Database connection timeout")
      );

      const settings = await getShopSettings();

      expect(settings).toEqual(DEFAULT_SHOP_SETTINGS);
    });
  });

  describe("updateShopSettingsSchema validation", () => {
    it("should validate valid shop settings input with stickyTopBar", () => {
      const validInput = {
        phone: "+998 90 123 45 67",
        email: "support@techgear.uz",
        address: "г. Ташкент, ул. Навои, 1",
        workingHours: "Пн-Пт: 09:00 - 18:00",
        deliveryCostUzs: 35000,
        freeDeliveryThresholdUzs: 600000,
        stickyTopBar: true,
      };

      const result = updateShopSettingsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stickyTopBar).toBe(true);
      }
    });

    it("should default stickyTopBar to false if omitted", () => {
      const inputWithoutSticky = {
        phone: "+998 90 123 45 67",
        email: "support@techgear.uz",
        address: "г. Ташкент, ул. Навои, 1",
        workingHours: "Пн-Пт: 09:00 - 18:00",
        deliveryCostUzs: 35000,
        freeDeliveryThresholdUzs: 600000,
      };

      const result = updateShopSettingsSchema.safeParse(inputWithoutSticky);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stickyTopBar).toBe(false);
      }
    });

    it("should reject short phone or invalid email", () => {
      const invalidInput = {
        phone: "123", // too short
        email: "not-an-email",
        address: "A", // too short
        workingHours: "",
        deliveryCostUzs: -100, // negative
        freeDeliveryThresholdUzs: -500, // negative
      };

      const result = updateShopSettingsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.phone).toBeDefined();
        expect(errors.email).toBeDefined();
        expect(errors.address).toBeDefined();
        expect(errors.deliveryCostUzs).toBeDefined();
        expect(errors.freeDeliveryThresholdUzs).toBeDefined();
      }
    });
  });
});
