// Formatters are created once at module level: building an Intl formatter is
// relatively expensive, and table rows call these many times per render.

// Dates are shown in UTC. Server Components render on the server, which doesn't
// know the viewer's time zone; showing local time would need client-side formatting.
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const numberFormatter = new Intl.NumberFormat("en-US");
const percentFormatter = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** 123456 → "$1,234.56" */
export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/** 123456 → "$1,235" (KPI tiles, where cents are noise) */
export function formatWholeCurrency(cents: number): string {
  return wholeCurrencyFormatter.format(cents / 100);
}

/** 123456789 → "$1.2M" (chart axis) */
export function formatCompactCurrency(cents: number): string {
  return compactCurrencyFormatter.format(cents / 100);
}

/** 12345 → "12,345" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 0.8169 → "81.7%" */
export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}

/** "2026-10-08T12:26:14Z" or "2026-10-08" → "Oct 8, 2026" */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

/** "2026-10-08" → "Oct 8" */
export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(isoDate));
}

/** "2026-10-08T12:26:14Z" → "Oct 8, 2026, 12:26 PM" (UTC) */
export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}

/** "Alex Morgan" → "AM". Used as an avatar fallback. */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
