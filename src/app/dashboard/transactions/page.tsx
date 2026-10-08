import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  RecentTransactions,
  RecentTransactionsSkeleton,
} from "@/features/transactions/components/recent-transactions";

export const metadata: Metadata = {
  title: "Transactions",
};

// The task only requires the sidebar item, so this page reuses the existing
// "recent transactions" table instead of a full paginated list like Users.
export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" description="The 50 most recent transactions across all users." />
      <Suspense fallback={<RecentTransactionsSkeleton />}>
        <RecentTransactions limit={50} />
      </Suspense>
    </>
  );
}
