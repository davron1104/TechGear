import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/cron/exchange-rate/route";
import * as exchangeRateService from "@/lib/exchange-rate-service";
import { NextRequest } from "next/server";

vi.mock("@/lib/exchange-rate-service", () => ({
  syncExchangeRateFromCbu: vi.fn(),
}));

describe("Cron /api/cron/exchange-rate", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it("should reject request with 401 if CRON_SECRET is set and auth header is missing", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";

    const request = new NextRequest("http://localhost:3000/api/cron/exchange-rate");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("should accept request if CRON_SECRET matches Bearer token", async () => {
    process.env.CRON_SECRET = "super-secret-cron-key";
    vi.mocked(exchangeRateService.syncExchangeRateFromCbu).mockResolvedValueOnce({
      success: true,
      exchangeRate: 12850,
      updatedAt: "2026-08-31T20:00:00.000Z",
      source: "Центральный банк РУз (cbu.uz)",
    });

    const request = new NextRequest("http://localhost:3000/api/cron/exchange-rate", {
      headers: {
        authorization: "Bearer super-secret-cron-key",
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.exchangeRate).toBe(12850);
  });

  it("should return 500 if syncExchangeRateFromCbu fails", async () => {
    vi.mocked(exchangeRateService.syncExchangeRateFromCbu).mockResolvedValueOnce({
      success: false,
      error: "CBU API down",
    });

    const request = new NextRequest("http://localhost:3000/api/cron/exchange-rate");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("CBU API down");
  });
});
