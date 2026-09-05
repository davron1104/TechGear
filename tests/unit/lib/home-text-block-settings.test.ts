import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getHomeTextBlockSettings } from "@/lib/settings-server";
import {
  DEFAULT_HOME_TEXT_BLOCK_SETTINGS,
  HOME_TEXT_BLOCK_KEY,
  HomeTextBlockSettings,
} from "@/lib/settings";
import { updateHomeTextBlockSchema } from "@/lib/validations/settings";

vi.mock("@/lib/prisma", () => ({
  default: {
    systemSetting: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("Home Text Block Settings Service & Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHomeTextBlockSettings", () => {
    it("should return DEFAULT_HOME_TEXT_BLOCK_SETTINGS when database returns null record", async () => {
      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValueOnce(null);

      const settings = await getHomeTextBlockSettings();

      expect(settings).toEqual(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);
      expect(prisma.systemSetting.findUnique).toHaveBeenCalledWith({
        where: { key: HOME_TEXT_BLOCK_KEY },
      });
    });

    it("should return parsed settings when valid JSON with features is stored in DB", async () => {
      const customSettings: HomeTextBlockSettings = {
        enabled: false,
        ru: {
          title: "Кастомный заголовок RU",
          content: "Кастомный текст RU",
          features: [
            { title: "Кастом 1 RU", description: "Опис 1 RU" },
            { title: "Кастом 2 RU", description: "Опис 2 RU" },
            { title: "Кастом 3 RU", description: "Опис 3 RU" },
          ],
        },
        uz: {
          title: "Maxsus sarlavha UZ",
          content: "Maxsus matn UZ",
          features: [
            { title: "Maxsus 1 UZ", description: "Tavsif 1 UZ" },
            { title: "Maxsus 2 UZ", description: "Tavsif 2 UZ" },
            { title: "Maxsus 3 UZ", description: "Tavsif 3 UZ" },
          ],
        },
        en: {
          title: "Custom Title EN",
          content: "Custom Content EN",
          features: [
            { title: "Custom 1 EN", description: "Desc 1 EN" },
            { title: "Custom 2 EN", description: "Desc 2 EN" },
            { title: "Custom 3 EN", description: "Desc 3 EN" },
          ],
        },
      };

      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValueOnce({
        key: HOME_TEXT_BLOCK_KEY,
        value: JSON.stringify(customSettings),
        updatedAt: new Date(),
      });

      const settings = await getHomeTextBlockSettings();

      expect(settings).toEqual(customSettings);
    });

    it("should ensure backward compatibility when DB contains legacy record without features", async () => {
      const legacySettings = {
        enabled: true,
        ru: {
          title: "Старый сохраненный заголовок",
          content: "Старый сохраненный текст",
        },
        uz: {
          title: "Eski sarlavha",
          content: "Eski matn",
        },
        en: {
          title: "Old title",
          content: "Old text",
        },
      };

      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValueOnce({
        key: HOME_TEXT_BLOCK_KEY,
        value: JSON.stringify(legacySettings),
        updatedAt: new Date(),
      });

      const settings = await getHomeTextBlockSettings();

      // Заголовки и тексты сохранены
      expect(settings.ru.title).toBe("Старый сохраненный заголовок");
      expect(settings.ru.content).toBe("Старый сохраненный текст");
      expect(settings.uz.title).toBe("Eski sarlavha");
      expect(settings.en.title).toBe("Old title");

      // features автоматически дополнились дефолтными значениями
      expect(settings.ru.features).toEqual(
        DEFAULT_HOME_TEXT_BLOCK_SETTINGS.ru.features
      );
      expect(settings.uz.features).toEqual(
        DEFAULT_HOME_TEXT_BLOCK_SETTINGS.uz.features
      );
      expect(settings.en.features).toEqual(
        DEFAULT_HOME_TEXT_BLOCK_SETTINGS.en.features
      );
    });

    it("should fallback safely to defaults on invalid JSON string", async () => {
      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValueOnce({
        key: HOME_TEXT_BLOCK_KEY,
        value: "{ invalid-json",
        updatedAt: new Date(),
      });

      const settings = await getHomeTextBlockSettings();

      expect(settings).toEqual(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);
    });

    it("should fallback safely when database throws an exception", async () => {
      vi.mocked(prisma.systemSetting.findUnique).mockRejectedValueOnce(
        new Error("Database connection error")
      );

      const settings = await getHomeTextBlockSettings();

      expect(settings).toEqual(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);
    });
  });

  describe("updateHomeTextBlockSchema validation", () => {
    it("should validate complete valid input with 3 features", () => {
      const validInput: HomeTextBlockSettings = {
        enabled: true,
        ru: {
          title: "Официальный магазин TechGear",
          content: "Описание магазина на русском языке.",
          features: [
            { title: "100% Оригинал", description: "Официальная гарантия" },
            { title: "Быстрая доставка", description: "По всему Узбекистану" },
            { title: "Поддержка 24/7", description: "Экспертная помощь" },
          ],
        },
        uz: {
          title: "TechGear rasmiy do'koni",
          content: "Do'kon tavsifi o'zbek tilida.",
          features: [
            { title: "100% Asl", description: "Kafolat" },
            { title: "Yetkazib berish", description: "O'zbekiston" },
            { title: "Qo'llab-quvvatlash", description: "Yordam" },
          ],
        },
        en: {
          title: "TechGear Official Store",
          content: "Store description in English.",
          features: [
            { title: "100% Genuine", description: "Official warranty" },
            { title: "Fast Delivery", description: "Across Uzbekistan" },
            { title: "24/7 Support", description: "Expert help" },
          ],
        },
      };

      const result = updateHomeTextBlockSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate input where uz and en features are empty strings", () => {
      const partialInput = {
        enabled: true,
        ru: {
          title: "Официальный магазин TechGear",
          content: "Описание магазина на русском языке.",
          features: [
            { title: "100% Оригинал", description: "Официальная гарантия" },
            { title: "Быстрая доставка", description: "По всему Узбекистану" },
            { title: "Поддержка 24/7", description: "Экспертная помощь" },
          ],
        },
        uz: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
        en: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
      };

      const result = updateHomeTextBlockSchema.safeParse(partialInput);
      expect(result.success).toBe(true);
    });

    it("should reject input when Russian feature title is empty", () => {
      const invalidInput = {
        enabled: true,
        ru: {
          title: "Заголовок",
          content: "Описание",
          features: [
            { title: "   ", description: "Официальная гарантия" },
            { title: "Быстрая доставка", description: "По всему Узбекистану" },
            { title: "Поддержка 24/7", description: "Экспертная помощь" },
          ],
        },
        uz: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
        en: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
      };

      const result = updateHomeTextBlockSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path.join(".") === "ru.features.0.title"
        );
        expect(issue).toBeDefined();
      }
    });

    it("should reject input when Russian feature description is empty", () => {
      const invalidInput = {
        enabled: true,
        ru: {
          title: "Заголовок",
          content: "Описание",
          features: [
            { title: "100% Оригинал", description: "" },
            { title: "Быстрая доставка", description: "По всему Узбекистану" },
            { title: "Поддержка 24/7", description: "Экспертная помощь" },
          ],
        },
        uz: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
        en: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
      };

      const result = updateHomeTextBlockSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path.join(".") === "ru.features.0.description"
        );
        expect(issue).toBeDefined();
      }
    });

    it("should reject when feature title exceeds max length", () => {
      const invalidInput = {
        enabled: true,
        ru: {
          title: "Заголовок",
          content: "Описание",
          features: [
            { title: "A".repeat(61), description: "Описание" },
            { title: "Быстрая доставка", description: "По всему Узбекистану" },
            { title: "Поддержка 24/7", description: "Экспертная помощь" },
          ],
        },
        uz: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
        en: {
          title: "",
          content: "",
          features: [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        },
      };

      const result = updateHomeTextBlockSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
