"use client";

import { Area, AreaChart, CartesianGrid, type TooltipContentProps, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatCurrency, formatDate, formatShortDate } from "@/lib/format";
import type { RevenuePoint } from "../types";

// Client Component only because recharts needs the browser: it measures the
// container, renders SVG from it and handles hover. All data preparation happens
// on the server; this component just receives ready points.

const SERIES_COLOR = "#2a78d6"; // single series: blue, ≥3:1 contrast on white
const GRID_COLOR = "#e4e4e7"; // zinc-200: recessive hairlines
const AXIS_TEXT = { fill: "#71717a", fontSize: 12 }; // zinc-500

export function RevenueChartClient({ data }: { data: RevenuePoint[] }) {
  return (
    <AreaChart
      data={data}
      responsive
      style={{ width: "100%", height: 288 }}
      margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
    >
      <CartesianGrid vertical={false} stroke={GRID_COLOR} />
      <XAxis
        dataKey="date"
        tickFormatter={formatShortDate}
        tickLine={false}
        axisLine={false}
        minTickGap={24}
        tick={AXIS_TEXT}
      />
      <YAxis
        tickFormatter={formatCompactCurrency}
        tickLine={false}
        axisLine={false}
        width={56}
        tick={AXIS_TEXT}
      />
      <Tooltip cursor={{ stroke: "#a1a1aa", strokeWidth: 1 }} content={RevenueTooltip} />
      <Area
        dataKey="revenueCents"
        type="monotone"
        stroke={SERIES_COLOR}
        strokeWidth={2}
        fill={SERIES_COLOR}
        fillOpacity={0.1}
        activeDot={{ r: 4, fill: SERIES_COLOR, stroke: "#fff", strokeWidth: 2 }}
      />
    </AreaChart>
  );
}

function RevenueTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="text-xs text-zinc-500">{formatDate(String(label))}</p>
      <p className="mt-1 flex items-center gap-2 font-medium">
        {/* Identity comes from the swatch; the text stays in normal text color. */}
        <span className="size-2 rounded-full" style={{ backgroundColor: SERIES_COLOR }} aria-hidden />
        {formatCurrency(Number(payload[0].value))}
      </p>
    </div>
  );
}
