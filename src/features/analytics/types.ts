import type { Period } from "./schemas";

export type RevenuePoint = {
  date: string; // YYYY-MM-DD
  revenueCents: number;
};

export type Analytics = {
  /** The period actually used (an invalid custom range falls back to the default). */
  period: Period;
  revenueCents: number;
  /** Succeeded transactions in the period. */
  transactionsCount: number;
  /** Users who logged in or paid in the period. */
  activeUsers: number;
  /** Share of active users who paid at least once, from 0 to 1. */
  conversionRate: number;
  /** One point per day, including days without revenue. */
  revenueSeries: RevenuePoint[];
};
