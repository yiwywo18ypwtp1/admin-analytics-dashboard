import { ArrowLeftRight } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Period } from "@/features/analytics/schemas";
import { getRecentTransactions } from "../data";
import { TransactionsTable, TransactionsTableSkeleton } from "./transactions-table";

type RecentTransactionsProps = {
  /** Dashboard: transactions inside the selected period. */
  period?: Period;
  /** User page: this user's transactions. */
  userId?: number;
  limit?: number;
};

// Async Server Component: fetches its own data, so the page can stream it
// in a separate <Suspense> without waiting for it.
export async function RecentTransactions({ period, userId, limit }: RecentTransactionsProps) {
  const transactions = await getRecentTransactions({ period, userId, limit });

  return (
    <RecentTransactionsCard>
      {transactions.length > 0 ? (
        <TransactionsTable transactions={transactions} showUser={userId === undefined} />
      ) : (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet"
          description={period ? "There were no transactions in this period." : undefined}
          className="py-10"
        />
      )}
    </RecentTransactionsCard>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <RecentTransactionsCard>
      <TransactionsTableSkeleton />
    </RecentTransactionsCard>
  );
}

// Shared frame, so the skeleton and the real card have the same size and title.
function RecentTransactionsCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <h2 className="px-5 pt-5 pb-3 text-base font-semibold">Recent transactions</h2>
      {children}
    </Card>
  );
}
