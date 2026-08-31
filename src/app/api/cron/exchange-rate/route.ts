import { NextRequest, NextResponse } from "next/server";
import { syncExchangeRateFromCbu } from "@/lib/exchange-rate-service";

export const dynamic = "force-dynamic";

/**
 * Daily Cron endpoint for automatic USD exchange rate synchronization from CBU.
 * Secured via CRON_SECRET authorization header if configured.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const result = await syncExchangeRateFromCbu();

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error || "Failed to synchronize exchange rate from CBU.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    exchangeRate: result.exchangeRate,
    updatedAt: result.updatedAt,
    source: result.source,
  });
}
