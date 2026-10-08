import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsSection, AnalyticsSectionSkeleton } from "@/features/analytics/components/analytics-section";
import { parsePeriod } from "@/features/analytics/schemas";
import {
  RecentTransactions,
  RecentTransactionsSkeleton,
} from "@/features/transactions/components/recent-transactions";

export const metadata: Metadata = {
  title: "Overview",
};

// The page itself doesn't await anything: the title is part of the prerendered
// shell and shows instantly; everything that depends on the URL streams in below.
export default function OverviewPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <>
      <PageHeader title="Overview" description="Key metrics for the selected period." />
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Overview({ searchParams }: Pick<PageProps<"/dashboard">, "searchParams">) {
  // parsePeriod uses new Date() ("today"), which must be the request's today,
  // not the moment the page was prerendered.
  await connection();
  const period = parsePeriod(await searchParams);
  const periodKey = `${period.from}:${period.to}`;

  // Why `key`: changing the period is a client navigation (a transition). By default
  // React keeps showing the OLD data until the new data is ready, with no feedback.
  // A new key makes it a new Suspense boundary, so its skeleton shows immediately.
  // Only these two sections reload; the layout (sidebar, header) is untouched.
  return (
    <div className="space-y-6">
      <Suspense key={`analytics:${periodKey}`} fallback={<AnalyticsSectionSkeleton />}>
        <AnalyticsSection period={period} />
      </Suspense>
      <Suspense key={`transactions:${periodKey}`} fallback={<RecentTransactionsSkeleton />}>
        <RecentTransactions period={period} />
      </Suspense>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <AnalyticsSectionSkeleton />
      <RecentTransactionsSkeleton />
    </div>
  );
}
