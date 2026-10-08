import { type NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/features/analytics/data";
import { parsePeriod } from "@/features/analytics/schemas";
import type { Analytics } from "@/features/analytics/types";

// GET /api/analytics?period=7d | 30d | 90d | custom&from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const period = parsePeriod(Object.fromEntries(request.nextUrl.searchParams));
  return NextResponse.json<Analytics>(await getAnalytics(period));
}
