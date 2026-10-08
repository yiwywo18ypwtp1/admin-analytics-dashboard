import { getAnalytics } from "../data";
import type { Period } from "../schemas";
import { KpiCards, KpiCardsSkeleton } from "./kpi-cards";
import { RevenueChart, RevenueChartSkeleton } from "./revenue-chart";

// KPIs and the chart come from the same getAnalytics() result, so they are
// fetched once here and passed down, instead of each component querying the DB.
export async function AnalyticsSection({ period }: { period: Period }) {
  const analytics = await getAnalytics(period);

  return (
    <>
      <KpiCards analytics={analytics} />
      <RevenueChart analytics={analytics} />
    </>
  );
}

export function AnalyticsSectionSkeleton() {
  return (
    <>
      <KpiCardsSkeleton />
      <RevenueChartSkeleton />
    </>
  );
}
