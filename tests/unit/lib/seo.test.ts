import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getBaseUrl,
  normalizeSeoPath,
  getI18nAlternates,
  getOgLocale,
  getPrivatePageRobots,
} from "@/lib/seo";

describe("SEO Helpers (src/lib/seo.ts)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getBaseUrl", () => {
    it("should return NEXT_PUBLIC_APP_URL if defined", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://techgear.uz";
      expect(getBaseUrl()).toBe("https://techgear.uz");
    });

    it("should strip trailing slash from NEXT_PUBLIC_APP_URL", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://techgear.uz///";
      expect(getBaseUrl()).toBe("https://techgear.uz");
    });

    it("should fallback to APP_URL if NEXT_PUBLIC_APP_URL is not set", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      process.env.APP_URL = "https://staging.techgear.uz";
      expect(getBaseUrl()).toBe("https://staging.techgear.uz");
    });

    it("should fallback to localhost if no environment variables are set", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.APP_URL;
      expect(getBaseUrl()).toBe("http://localhost:3000");
    });
  });

  describe("normalizeSeoPath", () => {
    it("should normalize root paths to empty string", () => {
      expect(normalizeSeoPath("")).toBe("");
      expect(normalizeSeoPath("/")).toBe("");
    });

    it("should strip locale prefixes", () => {
      expect(normalizeSeoPath("/ru")).toBe("");
      expect(normalizeSeoPath("/uz")).toBe("");
      expect(normalizeSeoPath("/en")).toBe("");
      expect(normalizeSeoPath("/ru/catalog")).toBe("/catalog");
      expect(normalizeSeoPath("/uz/product/test-slug")).toBe("/product/test-slug");
      expect(normalizeSeoPath("/en/catalog/mice")).toBe("/catalog/mice");
    });

    it("should strip query parameters and hash fragments", () => {
      expect(normalizeSeoPath("/catalog?search=keyboard&sort=price")).toBe("/catalog");
      expect(normalizeSeoPath("/ru/catalog?page=2#specs")).toBe("/catalog");
    });

    it("should ensure leading slash and strip trailing slash", () => {
      expect(normalizeSeoPath("catalog/keyboards/")).toBe("/catalog/keyboards");
    });
  });

  describe("getI18nAlternates", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_URL = "https://techgear.uz";
    });

    it("should generate canonical and languages for root page", () => {
      const alternates = getI18nAlternates({
        path: "/",
        locale: "ru",
      });

      expect(alternates.canonical).toBe("https://techgear.uz/ru");
      expect(alternates.languages).toEqual({
        ru: "https://techgear.uz/ru",
        uz: "https://techgear.uz/uz",
        en: "https://techgear.uz/en",
      });
      expect(alternates.languages["x-default"]).toBeUndefined();
    });

    it("should generate canonical for specific locale and path", () => {
      const alternates = getI18nAlternates({
        path: "/product/keyboard-pro",
        locale: "uz",
      });

      expect(alternates.canonical).toBe("https://techgear.uz/uz/product/keyboard-pro");
      expect(alternates.languages).toEqual({
        ru: "https://techgear.uz/ru/product/keyboard-pro",
        uz: "https://techgear.uz/uz/product/keyboard-pro",
        en: "https://techgear.uz/en/product/keyboard-pro",
      });
    });

    it("should include x-default when requested", () => {
      const alternates = getI18nAlternates({
        path: "/catalog",
        locale: "en",
        includeXDefault: true,
      });

      expect(alternates.canonical).toBe("https://techgear.uz/en/catalog");
      expect(alternates.languages["x-default"]).toBe("https://techgear.uz/ru/catalog");
    });
  });

  describe("getOgLocale", () => {
    it("should map supported locales to OpenGraph locale tags", () => {
      expect(getOgLocale("ru")).toBe("ru_RU");
      expect(getOgLocale("uz")).toBe("uz_UZ");
      expect(getOgLocale("en")).toBe("en_US");
    });
  });

  describe("getPrivatePageRobots", () => {
    it("should return noindex, nofollow directives", () => {
      expect(getPrivatePageRobots()).toEqual({
        index: false,
        follow: false,
      });
    });
  });
});
