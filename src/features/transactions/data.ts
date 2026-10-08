import "server-only";

import { and, desc, eq, gte, lt } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { type Period, periodBounds } from "@/features/analytics/schemas";
import { simulateLatency } from "@/lib/mock-api";
import type { TransactionWithUser } from "./types";

type RecentTransactionsOptions = {
  /** Only this user's transactions (User details page). */
  userId?: number;
  /** Only transactions inside the period (Dashboard). */
  period?: Period;
  limit?: number;
};

// One function for both "Recent transactions" tables: the dashboard filters
// by period, the user page filters by user.
export async function getRecentTransactions({
  userId,
  period,
  limit = 10,
}: RecentTransactionsOptions = {}): Promise<TransactionWithUser[]> {
  await connection();
  await simulateLatency();

  const bounds = period ? periodBounds(period) : undefined;

  return db
    .select({
      id: transactions.id,
      userId: transactions.userId,
      amountCents: transactions.amountCents,
      status: transactions.status,
      createdAt: transactions.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(transactions)
    .innerJoin(users, eq(transactions.userId, users.id))
    .where(
      and(
        userId !== undefined ? eq(transactions.userId, userId) : undefined,
        bounds ? gte(transactions.createdAt, bounds.start) : undefined,
        bounds ? lt(transactions.createdAt, bounds.end) : undefined,
      ),
    )
    .orderBy(desc(transactions.createdAt), desc(transactions.id))
    .limit(limit);
}
