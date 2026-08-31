import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchCbuUsdRate,
  syncExchangeRateFromCbu,
  CBU_USD_API_URL,
  CBU_SOURCE_LABEL,
} from "@/lib/exchange-rate-service";
import prisma from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  default: {
    systemSetting: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("ExchangeRateService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchCbuUsdRate", () => {
    it("should successfully fetch and parse USD rate from CBU API", async () => {
      const mockCbuResponse = [
        {
          id: 1,
          Code: "840",
          Ccy: "USD",
          CcyNm_RU: "Доллар США",
          Rate: "12850.50",
          Date: "31.08.2026",
        },
      ];

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockCbuResponse,
      });

      const result = await fetchCbuUsdRate();
      expect(result.rate).toBe(12850.5);
      expect(result.date).toBe("31.08.2026");
      expect(global.fetch).toHaveBeenCalledWith(
        CBU_USD_API_URL,
        expect.objectContaining({ cache: "no-store" })
      );
    });

    it("should throw error if response is not ok", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
      });

      await expect(fetchCbuUsdRate()).rejects.toThrow(
        /Ответ сервера ЦБ РУз не успешен: HTTP 503/
      );
    });

    it("should throw error if JSON response is not an array", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "Invalid request" }),
      });

      await expect(fetchCbuUsdRate()).rejects.toThrow(/Неверный формат ответа/);
    });

    it("should throw error if Rate field is missing or invalid string", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [{ Ccy: "USD", Rate: "abc" }],
      });

      await expect(fetchCbuUsdRate()).rejects.toThrow(
        /Не удалось преобразовать курс/
      );
    });

    it("should throw error if parsed rate is out of bounds (< 1000 or > 100000)", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [{ Ccy: "USD", Rate: "500" }],
      });

      await expect(fetchCbuUsdRate()).rejects.toThrow(/выходит за допустимые пределы/);
    });

    it("should throw error on fetch timeout/abort", async () => {
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";

      global.fetch = vi.fn().mockRejectedValueOnce(abortError);

      await expect(fetchCbuUsdRate()).rejects.toThrow(/Превышено время ожидания/);
    });
  });

  describe("syncExchangeRateFromCbu", () => {
    it("should fetch rate and persist in SystemSetting via Prisma transaction", async () => {
      const mockCbuResponse = [
        {
          Ccy: "USD",
          Rate: "12800.00",
          Date: "31.08.2026",
        },
      ];

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockCbuResponse,
      });

      vi.mocked(prisma.$transaction).mockResolvedValueOnce([] as never);

      const result = await syncExchangeRateFromCbu();

      expect(result.success).toBe(true);
      expect(result.exchangeRate).toBe(12800);
      expect(result.source).toBe(CBU_SOURCE_LABEL);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should return failure object and not throw if CBU fetch fails", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network connection failed"));

      const result = await syncExchangeRateFromCbu();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network connection failed");
    });
  });
});
