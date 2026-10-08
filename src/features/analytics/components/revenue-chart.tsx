import { ChartNoAxesCombined } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Analytics } from "../types";
import { RevenueChartClient } from "./revenue-chart-client";

// Server wrapper: title, empty state and the data table are plain HTML.
// Only the SVG chart itself (RevenueChartClient) is shipped as client JS.
export function RevenueChart({ analytics }: { analytics: Analytics }) {
  const { period, revenueSeries, revenueCents } = analytics;

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">Revenue</h2>
        <p className="text-sm text-zinc-500">
          {formatDate(period.from)} – {formatDate(period.to)}
        </p>
      </div>

      {revenueCents === 0 ? (
        <EmptyState icon={ChartNoAxesCombined} title="No revenue in this period" className="py-20" />
      ) : (
        <>
          <RevenueChartClient data={revenueSeries} />
          {/* The same numbers as a table: for screen readers and anyone who needs exact values. */}
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">View as table</summary>
            <div className="mt-2 max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="text-left text-xs text-zinc-500">
                  <tr>
                    <th className="py-1 font-medium">Date</th>
                    <th className="py-1 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueSeries.map((point) => (
                    <tr key={point.date} className="border-t border-zinc-100">
                      <td className="py-1">{formatDate(point.date)}</td>
                      <td className="py-1 text-right tabular-nums">{formatCurrency(point.revenueCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </Card>
  );
}

export function RevenueChartSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="mb-4 h-5 w-24" />
      <Skeleton className="h-72 w-full" />
    </Card>
  );
}
