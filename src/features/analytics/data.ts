import "server-only";

import { and, count, countDistinct, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { activity, transactions } from "@/db/schema";
import { simulateLatency } from "@/lib/mock-api";
import { type Period, periodBounds, periodDays } from "./schemas";
import type { Analytics } from "./types";

export async function getAnalytics(period: Period): Promise<Analytics> {
  await connection();
  await simulateLatency();

  const { start, end } = periodBounds(period);
  const paidInPeriod = and(
    eq(transactions.status, "succeeded"),
    gte(transactions.createdAt, start),
    lt(transactions.createdAt, end),
  );

  // The four queries are independent. better-sqlite3 is synchronous, so today they
  // still run one by one; with an async DB driver Promise.all would run them in parallel.
  const [[totals], [active], [paying], dailyRevenue] = await Promise.all([
    db
      .select({
        revenueCents: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
        transactionsCount: count(),
      })
      .from(transactions)
      .where(paidInPeriod),

    db
      .select({ count: countDistinct(activity.userId) })
      .from(activity)
      .where(
        and(
          inArray(activity.type, ["login", "payment"]),
          gte(activity.createdAt, start),
          lt(activity.createdAt, end),
        ),
      ),

    db.select({ count: countDistinct(transactions.userId) }).from(transactions).where(paidInPeriod),

    db
      .select({
        date: sql<string>`substr(${transactions.createdAt}, 1, 10)`.as("date"),
        revenueCents: sql<number>`sum(${transactions.amountCents})`,
      })
      .from(transactions)
      .where(paidInPeriod)
      .groupBy(sql`date`),
  ]);

  // SQL only returns days that had payments; the chart needs every day.
  const revenueByDate = new Map(dailyRevenue.map((row) => [row.date, row.revenueCents]));

  return {
    period,
    revenueCents: totals.revenueCents,
    transactionsCount: totals.transactionsCount,
    activeUsers: active.count,
    conversionRate: active.count > 0 ? paying.count / active.count : 0,
    revenueSeries: periodDays(period).map((date) => ({
      date,
      revenueCents: revenueByDate.get(date) ?? 0,
    })),
  };
}
