import type { activity, users } from "@/db/schema";

// The allowed values are a domain fact, so they live here, not in the DB schema.
// The DB schema and zod schemas both import them, which keeps everything in sync.
export const USER_ROLES = ["admin", "editor", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "inactive", "banned"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "account_created",
  "profile_updated",
  "status_changed",
  "login",
  "payment",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

// Row types are inferred from the Drizzle schema, so they can't drift from the DB.
export type User = typeof users.$inferSelect;
export type ActivityEvent = typeof activity.$inferSelect;

export type UserStats = {
  totalRevenueCents: number;
  paymentsCount: number;
  averagePaymentCents: number;
  lastPaymentAt: string | null;
};
