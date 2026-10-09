import { describe, expect, it } from "vitest";
import { parsePeriod, periodBounds, periodDays } from "./schemas";

// A fixed "now" makes the date math deterministic.
const now = new Date("2026-10-08T15:00:00Z");

describe("parsePeriod", () => {
  it("defaults to the last 30 days, including today", () => {
    expect(parsePeriod({}, now)).toEqual({ preset: "30d", from: "2026-09-09", to: "2026-10-08" });
  });

  it("resolves the presets", () => {
    expect(parsePeriod({ period: "7d" }, now)).toEqual({ preset: "7d", from: "2026-10-02", to: "2026-10-08" });
    expect(parsePeriod({ period: "90d" }, now)).toEqual({ preset: "90d", from: "2026-07-11", to: "2026-10-08" });
  });

  it("accepts a valid custom range", () => {
    expect(parsePeriod({ period: "custom", from: "2026-09-01", to: "2026-09-03" }, now)).toEqual({
      preset: "custom",
      from: "2026-09-01",
      to: "2026-09-03",
    });
  });

  it("falls back to 30 days for an invalid custom range", () => {
    const fallback = parsePeriod({}, now);
    // missing dates, reversed, in the future, longer than a year, not real dates
    expect(parsePeriod({ period: "custom" }, now)).toEqual(fallback);
    expect(parsePeriod({ period: "custom", from: "2026-09-10", to: "2026-09-01" }, now)).toEqual(fallback);
    expect(parsePeriod({ period: "custom", from: "2026-10-01", to: "2026-12-01" }, now)).toEqual(fallback);
    expect(parsePeriod({ period: "custom", from: "2024-01-01", to: "2026-01-01" }, now)).toEqual(fallback);
    expect(parsePeriod({ period: "custom", from: "2026-02-30", to: "2026-03-01" }, now)).toEqual(fallback);
  });

  it("falls back to 30 days for an unknown period", () => {
    expect(parsePeriod({ period: "garbage" }, now)).toEqual(parsePeriod({}, now));
  });
});

describe("periodDays", () => {
  it("lists every day of the period, both ends included", () => {
    const days = periodDays({ preset: "custom", from: "2026-09-29", to: "2026-10-02" });
    expect(days).toEqual(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
    expect(periodDays(parsePeriod({ period: "7d" }, now))).toHaveLength(7);
  });
});

describe("periodBounds", () => {
  it("returns an inclusive start and an exclusive end (midnight after the last day)", () => {
    expect(periodBounds({ preset: "custom", from: "2026-09-01", to: "2026-09-03" })).toEqual({
      start: "2026-09-01T00:00:00.000Z",
      end: "2026-09-04T00:00:00.000Z",
    });
  });
});
