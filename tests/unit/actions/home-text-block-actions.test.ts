import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getAdminHomeTextBlockSettings,
  updateHomeTextBlockSettings,
} from "@/actions/settings-actions";
import {
  DEFAULT_HOME_TEXT_BLOCK_SETTINGS,
  HOME_TEXT_BLOCK_KEY,
} from "@/lib/settings";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    systemSetting: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Home Text Block Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminHomeTextBlockSettings", () => {
    it("should reject unauthenticated request", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await getAdminHomeTextBlockSettings();

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

      const result = await getAdminHomeTextBlockSettings();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Доступ запрещен");
      }
    });

    it("should allow admin role and return home text block settings", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "a-1", email: "admin@techgear.uz", role: "ADMIN" },
        expires: "2099-01-01",
      });
      vi.mocked(prisma.systemSetting.findUnique).mockResolvedValueOnce(null);

      const result = await getAdminHomeTextBlockSettings();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);
      }
    });
  });

  describe("updateHomeTextBlockSettings", () => {
    it("should reject unauthenticated user", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const result = await updateHomeTextBlockSettings(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);

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

      const result = await updateHomeTextBlockSettings(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Доступ запрещен");
      }
    });

    it("should reject invalid payload with validation errors", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "a-1", email: "admin@techgear.uz", role: "ADMIN" },
        expires: "2099-01-01",
      });

      const invalidPayload = {
        enabled: true,
        ru: { title: "", content: "" }, // invalid empty required fields
        uz: { title: "", content: "" },
        en: { title: "", content: "" },
      };

      const result = await updateHomeTextBlockSettings(invalidPayload);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Ошибка валидации");
        expect(result.fields).toBeDefined();
      }
    });

    it("should allow admin, validate and upsert into SystemSetting", async () => {
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        user: { id: "a-1", email: "admin@techgear.uz", role: "ADMIN" },
        expires: "2099-01-01",
      });
      vi.mocked(prisma.systemSetting.upsert).mockResolvedValueOnce({
        key: HOME_TEXT_BLOCK_KEY,
        value: JSON.stringify(DEFAULT_HOME_TEXT_BLOCK_SETTINGS),
        updatedAt: new Date(),
      });

      const result = await updateHomeTextBlockSettings(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(DEFAULT_HOME_TEXT_BLOCK_SETTINGS);
      }

      expect(prisma.systemSetting.upsert).toHaveBeenCalledWith({
        where: { key: HOME_TEXT_BLOCK_KEY },
        create: {
          key: HOME_TEXT_BLOCK_KEY,
          value: JSON.stringify(DEFAULT_HOME_TEXT_BLOCK_SETTINGS),
        },
        update: {
          value: JSON.stringify(DEFAULT_HOME_TEXT_BLOCK_SETTINGS),
        },
      });
    });
  });
});
