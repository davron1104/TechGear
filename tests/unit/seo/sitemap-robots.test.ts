import { describe, it, expect, vi, beforeEach } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import prisma from "@/lib/prisma";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    category: {
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe("Sitemap and Robots Generators", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_APP_URL: "https://techgear.uz" };
  });

  describe("sitemap.ts", () => {
    it("should generate clean sitemap entries for ru, uz, en locales", async () => {
      const catDate = new Date("2026-02-01T12:00:00Z");
      const prodDate = new Date("2026-02-15T15:30:00Z");

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { slug: "keyboards", updatedAt: catDate },
        { slug: "mice", updatedAt: catDate },
      ] as any);

      vi.mocked(prisma.product.findMany).mockResolvedValue([
        { slug: "cyberkeys-pro-rgb", updatedAt: prodDate },
      ] as any);

      const entries = await sitemap();

      // Category filter check
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: { slug: true, updatedAt: true },
      });

      // Total count: (1 home + 1 catalog + 2 info + 2 categories + 1 product) * 3 locales = 21 URLs
      expect(entries).toHaveLength(21);

      // Home URLs
      expect(entries).toContainEqual({ url: "https://techgear.uz/ru" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/uz" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/en" });

      // Catalog URLs
      expect(entries).toContainEqual({ url: "https://techgear.uz/ru/catalog" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/uz/catalog" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/en/catalog" });

      // Delivery URLs
      expect(entries).toContainEqual({ url: "https://techgear.uz/ru/delivery" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/uz/delivery" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/en/delivery" });

      // Warranty URLs
      expect(entries).toContainEqual({ url: "https://techgear.uz/ru/warranty" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/uz/warranty" });
      expect(entries).toContainEqual({ url: "https://techgear.uz/en/warranty" });

      // Category URLs with real updatedAt
      expect(entries).toContainEqual({
        url: "https://techgear.uz/ru/catalog/keyboards",
        lastModified: catDate,
      });
      expect(entries).toContainEqual({
        url: "https://techgear.uz/uz/catalog/mice",
        lastModified: catDate,
      });

      // Product URLs with real updatedAt
      expect(entries).toContainEqual({
        url: "https://techgear.uz/en/product/cyberkeys-pro-rgb",
        lastModified: prodDate,
      });

      // Verify no artificial fields
      for (const entry of entries) {
        expect((entry as any).changeFrequency).toBeUndefined();
        expect((entry as any).priority).toBeUndefined();
        expect((entry as any).alternates).toBeUndefined();
        expect(entry.url).not.toContain("?");
        expect(entry.url).not.toContain("search");
        expect(entry.url).not.toContain("checkout");
        expect(entry.url).not.toContain("account");
        expect(entry.url).not.toContain("login");
        expect(entry.url).not.toContain("admin");
      }
    });

    it("should handle empty categories and products safely", async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const entries = await sitemap();

      // Only home (3) + catalog (3) + delivery (3) + warranty (3) = 12 URLs
      expect(entries).toHaveLength(12);
    });
  });

  describe("robots.ts", () => {
    it("should generate correct robots rules and reference sitemap", () => {
      const robotsConfig = robots();

      expect(robotsConfig).toEqual({
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/admin/", "/api", "/api/"],
        },
        sitemap: "https://techgear.uz/sitemap.xml",
      });
    });

    it("should not disallow public routes or localized pages in robots.txt", () => {
      const robotsConfig = robots();
      const disallows = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules.flatMap((r) => r.disallow)
        : (robotsConfig.rules as any)?.disallow;

      expect(disallows).not.toContain("/catalog");
      expect(disallows).not.toContain("/ru/catalog");
      expect(disallows).not.toContain("/ru/account");
      expect(disallows).not.toContain("/en/checkout");
    });
  });
});
