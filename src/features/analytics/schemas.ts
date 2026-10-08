import { z } from "zod";

// Dashboard URL state: ?period=30d  or  ?period=custom&from=2026-01-01&to=2026-03-01

export const PERIOD_PRESETS = ["7d", "30d", "90d", "custom"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

const PRESET_DAYS = { "7d": 7, "30d": 30, "90d": 90 } as const;
const DEFAULT_PRESET = "30d";
const MAX_CUSTOM_RANGE_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

const periodQuerySchema = z.object({
  period: z.enum(PERIOD_PRESETS).catch(DEFAULT_PRESET),
  from: z.iso.date().optional().catch(undefined),
  to: z.iso.date().optional().catch(undefined),
});

/** Resolved period. `from` and `to` are inclusive UTC dates (YYYY-MM-DD). */
export type Period = {
  preset: PeriodPreset;
  from: string;
  to: string;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * Turns URL params into a concrete date range. An invalid custom range
 * (missing dates, from > to, too long, in the future) falls back to the default preset.
 */
export function parsePeriod(searchParams: RawSearchParams, now = new Date()): Period {
  const { period, from, to } = periodQuerySchema.parse(searchParams);
  const today = toDateString(now);

  if (period === "custom") {
    const isValid =
      from !== undefined &&
      to !== undefined &&
      from <= to &&
      to <= today &&
      daysBetween(from, to) < MAX_CUSTOM_RANGE_DAYS;

    if (isValid) return { preset: "custom", from, to };
    return presetPeriod(DEFAULT_PRESET, now);
  }

  return presetPeriod(period, now);
}

/** ISO timestamps for SQL filters: `createdAt >= start AND createdAt < end`. */
export function periodBounds(period: Period): { start: string; end: string } {
  const end = new Date(Date.parse(period.to) + DAY_MS);
  return { start: `${period.from}T00:00:00.000Z`, end: end.toISOString() };
}

/** Every date of the period, used to fill days without revenue in the chart. */
export function periodDays(period: Period): string[] {
  const days: string[] = [];
  for (let time = Date.parse(period.from); time <= Date.parse(period.to); time += DAY_MS) {
    days.push(toDateString(new Date(time)));
  }
  return days;
}

function presetPeriod(preset: keyof typeof PRESET_DAYS, now: Date): Period {
  // "7 days" = today and the 6 days before it.
  const from = new Date(now.getTime() - (PRESET_DAYS[preset] - 1) * DAY_MS);
  return { preset, from: toDateString(from), to: toDateString(now) };
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / DAY_MS;
}
