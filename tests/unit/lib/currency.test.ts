import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  convertUzsToUsd,
  formatUzs,
  formatUsd,
  formatCurrency,
  DEFAULT_USD_EXCHANGE_RATE,
} from "@/lib/currency";
import { getExchangeRate } from "@/lib/currency-server";
import prisma from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  default: {
    systemSetting: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Currency Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("convertUzsToUsd", () => {
    it("should correctly convert UZS to USD at default exchange rate", () => {
      // 1 500 000 / 12 500 = 120
      expect(convertUzsToUsd(1500000, 12500)).toBe(120);
    });

    it("should correctly convert with custom exchange rate", () => {
      // 1 300 000 / 13 000 = 100
      expect(convertUzsToUsd(1300000, 13000)).toBe(100);
    });

    it("should round to 2 decimal places properly", () => {
      // 1 234 567 / 12 500 = 98.76536 -> 98.77
      expect(convertUzsToUsd(1234567, 12500)).toBe(98.77);
    });

    it("should handle 0 amount", () => {
      expect(convertUzsToUsd(0, 12500)).toBe(0);
    });

    it("should fallback to DEFAULT_USD_EXCHANGE_RATE for invalid or negative rates", () => {
      expect(convertUzsToUsd(1500000, 0)).toBe(120);
      expect(convertUzsToUsd(1500000, -100)).toBe(120);
      expect(convertUzsToUsd(1500000, NaN)).toBe(120);
    });
  });

  describe("formatUzs", () => {
    it("should format number with spaces and сум suffix for ru locale (default)", () => {
      const result = formatUzs(1500000, "ru");
      expect(result).toBe("1 500 000 сум");
    });

    it("should format number with spaces and so'm suffix for uz locale", () => {
      const result = formatUzs(1500000, "uz");
      expect(result).toBe("1 500 000 so'm");
    });

    it("should format number with commas and UZS suffix for en locale", () => {
      const result = formatUzs(1500000, "en");
      expect(result).toBe("1,500,000 UZS");
    });

    it("should handle zero amount across all locales", () => {
      expect(formatUzs(0, "ru")).toBe("0 сум");
      expect(formatUzs(0, "uz")).toBe("0 so'm");
      expect(formatUzs(0, "en")).toBe("0 UZS");
    });

    it("should format 1990 according to spec", () => {
      expect(formatUzs(1990, "ru")).toBe("1 990 сум");
      expect(formatUzs(1990, "uz")).toBe("1 990 so'm");
      expect(formatUzs(1990, "en")).toBe("1,990 UZS");
    });
  });

  describe("formatUsd", () => {
    it("should format whole dollars without trailing zeros", () => {
      expect(formatUsd(120)).toBe("$120");
    });

    it("should format decimal dollars with 2 fractional digits", () => {
      expect(formatUsd(98.77)).toBe("$98.77");
      expect(formatUsd(0.16)).toBe("$0.16");
    });

    it("should format consistently regardless of locale", () => {
      expect(formatUsd(0.16, "ru")).toBe("$0.16");
      expect(formatUsd(0.16, "uz")).toBe("$0.16");
      expect(formatUsd(0.16, "en")).toBe("$0.16");
    });
  });

  describe("formatCurrency", () => {
    it("should format as UZS with localized suffix across ru, uz, en", () => {
      expect(formatCurrency(1990, "UZS", 12500, "ru")).toBe("1 990 сум");
      expect(formatCurrency(1990, "UZS", 12500, "uz")).toBe("1 990 so'm");
      expect(formatCurrency(1990, "UZS", 12500, "en")).toBe("1,990 UZS");
    });

    it("should format as USD consistently across ru, uz, en", () => {
      expect(formatCurrency(1500000, "USD", 12500, "ru")).toBe("$120");
      expect(formatCurrency(1500000, "USD", 12500, "uz")).toBe("$120");
      expect(formatCurrency(1500000, "USD", 12500, "en")).toBe("$120");

      expect(formatCurrency(1990, "USD", 12500, "ru")).toBe("$0.16");
      expect(formatCurrency(1990, "USD", 12500, "uz")).toBe("$0.16");
      expect(formatCurrency(1990, "USD", 12500, "en")).toBe("$0.16");
    });

    it("should default to ru locale and UZS currency if omitted", () => {
      expect(formatCurrency(1500000)).toBe("1 500 000 сум");
    });
  });

  describe("getExchangeRate", () => {
    it("should return rate from database when record exists", async () => {
      (prisma.systemSetting.findUnique as any).mockResolvedValue({
        key: "USD_EXCHANGE_RATE",
        value: "13200",
      });

      const rate = await getExchangeRate();
      expect(rate).toBe(13200);
    });

    it("should return DEFAULT_USD_EXCHANGE_RATE when record is not in database", async () => {
      (prisma.systemSetting.findUnique as any).mockResolvedValue(null);

      const rate = await getExchangeRate();
      expect(rate).toBe(DEFAULT_USD_EXCHANGE_RATE);
    });

    it("should return DEFAULT_USD_EXCHANGE_RATE on database exception", async () => {
      (prisma.systemSetting.findUnique as any).mockRejectedValue(
        new Error("DB connection error")
      );

      const rate = await getExchangeRate();
      expect(rate).toBe(DEFAULT_USD_EXCHANGE_RATE);
    });
  });
});
