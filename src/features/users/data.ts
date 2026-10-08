import "server-only";

import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { SqliteError } from "better-sqlite3";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/db";
import { activity, transactions, users } from "@/db/schema";
import { simulateFailure, simulateLatency } from "@/lib/mock-api";
import type { MutationResult, Paginated } from "@/lib/types";
import type { UserInput, UsersQuery, UsersSortField, UserUpdate } from "./schemas";
import type { ActivityEvent, User, UserStats } from "./types";

// data.ts = DB access + rules that need the DB (unique email, activity log).
//
// Every read starts with `await connection()`. better-sqlite3 is synchronous, so
// without it Next.js could run the query once at build time and serve that frozen
// result forever. connection() means "only run this for a real request".
// It receives already validated input; validation happens at the entry points
// (Route Handlers, Server Actions) with the zod schemas from schemas.ts.

// Maps public sort keys from the URL to real columns. Only these columns can
// ever reach ORDER BY, so the URL can't inject arbitrary SQL.
const sortColumns = {
  name: users.name,
  email: users.email,
  status: users.status,
  revenue: users.revenueCents,
  createdAt: users.createdAt,
} satisfies Record<UsersSortField, unknown>;

export async function listUsers(query: UsersQuery): Promise<Paginated<User>> {
  await connection();
  await simulateLatency();

  const where = and(
    query.search
      ? or(like(users.name, `%${query.search}%`), like(users.email, `%${query.search}%`))
      : undefined,
    query.status ? eq(users.status, query.status) : undefined,
  );
  const direction = query.order === "asc" ? asc : desc;

  const items = await db
    .select()
    .from(users)
    .where(where)
    // id as a tie-breaker: without it, rows with equal values (e.g. same status)
    // can jump between pages.
    .orderBy(direction(sortColumns[query.sort]), direction(users.id))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const [{ total }] = await db.select({ total: count() }).from(users).where(where);

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

// React cache(): the user page asks for the same user twice per request
// (generateMetadata + the page). cache() makes the second call reuse the first
// result. It only lives for one request, so it never serves stale data.
export const getUser = cache(async (id: number): Promise<User | null> => {
  await connection();
  await simulateLatency();

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
});

export async function getUserStats(id: number): Promise<UserStats> {
  await connection();
  await simulateLatency();

  const [stats] = await db
    .select({
      paymentsCount: count(),
      totalRevenueCents: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
      lastPaymentAt: sql<string | null>`max(${transactions.createdAt})`,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, id), eq(transactions.status, "succeeded")));

  return {
    ...stats,
    averagePaymentCents:
      stats.paymentsCount > 0 ? Math.round(stats.totalRevenueCents / stats.paymentsCount) : 0,
  };
}

export async function getActivity(userId: number, limit = 20): Promise<ActivityEvent[]> {
  await connection();
  await simulateLatency();

  return db
    .select()
    .from(activity)
    .where(eq(activity.userId, userId))
    .orderBy(desc(activity.createdAt), desc(activity.id))
    .limit(limit);
}

export async function createUser(input: UserInput): Promise<MutationResult<User, "EMAIL_TAKEN">> {
  await simulateLatency();
  simulateFailure();

  const now = new Date().toISOString();

  try {
    // One transaction: the user and its "created" event are saved together or not at all.
    const user = db.transaction((tx) => {
      const created = tx
        .insert(users)
        .values({ ...input, avatarUrl: input.avatarUrl ?? null, createdAt: now, updatedAt: now })
        .returning()
        .get();

      tx.insert(activity)
        .values({ userId: created.id, type: "account_created", message: "Account created", createdAt: now })
        .run();

      return created;
    });

    return { ok: true, data: user };
  } catch (error) {
    if (isEmailTakenError(error)) return { ok: false, error: "EMAIL_TAKEN" };
    throw error;
  }
}

export async function updateUser(
  id: number,
  input: UserUpdate,
): Promise<MutationResult<User, "NOT_FOUND" | "EMAIL_TAKEN">> {
  await simulateLatency();
  simulateFailure();

  const now = new Date().toISOString();

  try {
    const user = db.transaction((tx) => {
      const existing = tx.select().from(users).where(eq(users.id, id)).get();
      if (!existing) return null;

      // Drizzle skips keys whose value is undefined, so PATCH only touches sent fields.
      const updated = tx
        .update(users)
        .set({ ...input, updatedAt: now })
        .where(eq(users.id, id))
        .returning()
        .get();

      const events: (typeof activity.$inferInsert)[] = [];
      if (input.status !== undefined && input.status !== existing.status) {
        events.push({
          userId: id,
          type: "status_changed",
          message: `Status changed from ${existing.status} to ${input.status}`,
          createdAt: now,
        });
      }
      const profileFields = ["name", "email", "role", "avatarUrl"] as const;
      if (profileFields.some((key) => input[key] !== undefined && input[key] !== existing[key])) {
        events.push({ userId: id, type: "profile_updated", message: "Profile updated", createdAt: now });
      }
      if (events.length > 0) tx.insert(activity).values(events).run();

      return updated;
    });

    if (!user) return { ok: false, error: "NOT_FOUND" };
    return { ok: true, data: user };
  } catch (error) {
    if (isEmailTakenError(error)) return { ok: false, error: "EMAIL_TAKEN" };
    throw error;
  }
}

export async function deleteUser(id: number): Promise<MutationResult<null, "NOT_FOUND">> {
  await simulateLatency();
  simulateFailure();

  // Transactions and activity are removed by ON DELETE CASCADE.
  const deleted = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });

  if (deleted.length === 0) return { ok: false, error: "NOT_FOUND" };
  return { ok: true, data: null };
}

// We rely on the UNIQUE constraint instead of a "SELECT … WHERE email = ?" check
// first: a separate check has a race (two requests can both pass it), the
// constraint doesn't. Drizzle wraps driver errors, so we check `cause` too.
function isEmailTakenError(error: unknown): boolean {
  const sqliteError = error instanceof SqliteError ? error : (error as { cause?: unknown })?.cause;
  return (
    sqliteError instanceof SqliteError &&
    sqliteError.code === "SQLITE_CONSTRAINT_UNIQUE" &&
    sqliteError.message.includes("users.email")
  );
}
