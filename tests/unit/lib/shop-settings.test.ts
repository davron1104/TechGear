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
  getLocalizedShopField,
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

    it("should parse multilingual JSON records correctly", async () => {
      const addressJson = JSON.stringify({
        ru: "г. Ташкент, ул. Навои, 1",
        uz: "Toshkent sh., Navoiy ko'ch., 1",
        en: "1 Navoi St., Tashkent",
      });
      const hoursJson = JSON.stringify({
        ru: "Пн-Сб: 09:00 - 19:00",
        uz: "Dush-Shan: 09:00 - 19:00",
        en: "Mon-Sat: 09:00 - 19:00",
      });

      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([
        { key: SHOP_PHONE_KEY, value: "+998 90 123 45 67", updatedAt: new Date() },
        { key: SHOP_EMAIL_KEY, value: "contact@techgear.uz", updatedAt: new Date() },
        { key: SHOP_ADDRESS_KEY, value: addressJson, updatedAt: new Date() },
        { key: SHOP_WORKING_HOURS_KEY, value: hoursJson, updatedAt: new Date() },
        { key: DELIVERY_COST_UZS_KEY, value: "25000", updatedAt: new Date() },
        { key: FREE_DELIVERY_THRESHOLD_UZS_KEY, value: "400000", updatedAt: new Date() },
        { key: STICKY_TOP_BAR_KEY, value: "true", updatedAt: new Date() },
      ]);

      const settings = await getShopSettings();

      expect(settings).toEqual({
        phone: "+998 90 123 45 67",
        email: "contact@techgear.uz",
        address: {
          ru: "г. Ташкент, ул. Навои, 1",
          uz: "Toshkent sh., Navoiy ko'ch., 1",
          en: "1 Navoi St., Tashkent",
        },
        workingHours: {
          ru: "Пн-Сб: 09:00 - 19:00",
          uz: "Dush-Shan: 09:00 - 19:00",
          en: "Mon-Sat: 09:00 - 19:00",
        },
        deliveryCostUzs: 25000,
        freeDeliveryThresholdUzs: 400000,
        stickyTopBar: true,
      });
    });

    it("should safely convert legacy plain string records to multilingual objects", async () => {
      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([
        { key: SHOP_ADDRESS_KEY, value: "г. Самарканд, пл. Регистан, 1", updatedAt: new Date() },
        { key: SHOP_WORKING_HOURS_KEY, value: "10:00 - 20:00", updatedAt: new Date() },
      ]);

      const settings = await getShopSettings();

      expect(settings.address).toEqual({
        ru: "г. Самарканд, пл. Регистан, 1",
        uz: "г. Самарканд, пл. Регистан, 1",
        en: "г. Самарканд, пл. Регистан, 1",
      });
      expect(settings.workingHours).toEqual({
        ru: "10:00 - 20:00",
        uz: "10:00 - 20:00",
        en: "10:00 - 20:00",
      });
    });

    it("should fallback to defaults when JSON is invalid or non-object (e.g. array, empty, null)", async () => {
      vi.mocked(prisma.systemSetting.findMany).mockResolvedValueOnce([
        { key: SHOP_ADDRESS_KEY, value: "", updatedAt: new Date() },
        { key: SHOP_WORKING_HOURS_KEY, value: "   ", updatedAt: new Date() },
      ]);

      const settings = await getShopSettings();

      expect(settings.address).toEqual(DEFAULT_SHOP_SETTINGS.address);
      expect(settings.workingHours).toEqual(DEFAULT_SHOP_SETTINGS.workingHours);
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

  describe("getLocalizedShopField helper", () => {
    it("should return localized value for object input", () => {
      const field = {
        ru: "Адрес RU",
        uz: "Manzil UZ",
        en: "Address EN",
      };

      expect(getLocalizedShopField(field, "ru")).toBe("Адрес RU");
      expect(getLocalizedShopField(field, "uz")).toBe("Manzil UZ");
      expect(getLocalizedShopField(field, "en")).toBe("Address EN");
    });

    it("should fallback to ru if specific locale is missing in object", () => {
      const field = {
        ru: "Адрес RU",
        uz: "",
        en: "",
      };

      expect(getLocalizedShopField(field, "uz")).toBe("Адрес RU");
      expect(getLocalizedShopField(field, "en")).toBe("Адрес RU");
    });

    it("should return plain string directly if legacy string is passed", () => {
      expect(getLocalizedShopField("Старый адрес", "uz")).toBe("Старый адрес");
    });

    it("should return empty string if field is null or undefined", () => {
      expect(getLocalizedShopField(undefined, "ru")).toBe("");
      expect(getLocalizedShopField(null, "uz")).toBe("");
    });
  });

  describe("updateShopSettingsSchema validation", () => {
    it("should validate valid shop settings input with multilingual address & workingHours", () => {
      const validInput = {
        phone: "+998 90 123 45 67",
        email: "support@techgear.uz",
        address: {
          ru: "г. Ташкент, ул. Навои, 1",
          uz: "Toshkent sh., Navoiy ko'ch., 1",
          en: "1 Navoi St., Tashkent",
        },
        workingHours: {
          ru: "Пн-Пт: 09:00 - 18:00",
          uz: "Dush-Juma: 09:00 - 18:00",
          en: "Mon-Fri: 09:00 - 18:00",
        },
        deliveryCostUzs: 35000,
        freeDeliveryThresholdUzs: 600000,
        stickyTopBar: true,
      };

      const result = updateShopSettingsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stickyTopBar).toBe(true);
        expect(result.data.address.ru).toBe("г. Ташкент, ул. Навои, 1");
        expect(result.data.workingHours.uz).toBe("Dush-Juma: 09:00 - 18:00");
      }
    });

    it("should preprocess legacy plain strings into multilingual objects", () => {
      const legacyInput = {
        phone: "+998 90 123 45 67",
        email: "support@techgear.uz",
        address: "г. Ташкент, ул. Навои, 1",
        workingHours: "Пн-Пт: 09:00 - 18:00",
        deliveryCostUzs: 35000,
        freeDeliveryThresholdUzs: 600000,
      };

      const result = updateShopSettingsSchema.safeParse(legacyInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.address).toEqual({
          ru: "г. Ташкент, ул. Навои, 1",
          uz: "",
          en: "",
        });
        expect(result.data.workingHours).toEqual({
          ru: "Пн-Пт: 09:00 - 18:00",
          uz: "",
          en: "",
        });
      }
    });

    it("should reject short phone or invalid email or empty ru address", () => {
      const invalidInput = {
        phone: "123", // too short
        email: "not-an-email",
        address: { ru: "" }, // empty
        workingHours: { ru: "" },
        deliveryCostUzs: -100, // negative
        freeDeliveryThresholdUzs: -500, // negative
      };

      const result = updateShopSettingsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.phone).toBeDefined();
        expect(errors.email).toBeDefined();
        expect(errors.deliveryCostUzs).toBeDefined();
        expect(errors.freeDeliveryThresholdUzs).toBeDefined();
        expect(result.error.issues.some((i) => i.path.join(".") === "address.ru")).toBe(true);
        expect(result.error.issues.some((i) => i.path.join(".") === "workingHours.ru")).toBe(true);
      }
    });
  });
});
