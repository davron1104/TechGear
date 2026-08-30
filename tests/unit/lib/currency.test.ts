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
    it("should format number with spaces and сум suffix", () => {
      const result = formatUzs(1500000);
      expect(result).toContain("1 500 000");
      expect(result).toContain("сум");
    });

    it("should handle zero amount", () => {
      expect(formatUzs(0)).toBe("0 сум");
    });
  });

  describe("formatUsd", () => {
    it("should format whole dollars without trailing zeros", () => {
      expect(formatUsd(120)).toBe("$120");
    });

    it("should format decimal dollars with 2 fractional digits", () => {
      expect(formatUsd(98.77)).toBe("$98.77");
    });
  });

  describe("formatCurrency", () => {
    it("should format as UZS when currency is UZS", () => {
      const formatted = formatCurrency(1500000, "UZS");
      expect(formatted).toContain("1 500 000");
      expect(formatted).toContain("сум");
    });

    it("should format as USD when currency is USD", () => {
      const formatted = formatCurrency(1500000, "USD", 12500);
      expect(formatted).toBe("$120");
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
