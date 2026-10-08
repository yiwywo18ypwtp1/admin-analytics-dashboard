import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { TransactionStatus, TransactionWithUser } from "../types";

const statusTone: Record<TransactionStatus, BadgeTone> = {
  succeeded: "success",
  pending: "warning",
  failed: "danger",
};

type TransactionsTableProps = {
  transactions: TransactionWithUser[];
  /** Hidden on the user's own page, where every row is the same user. */
  showUser?: boolean;
};

// Read-only table: no state or handlers, so it stays a Server Component (zero JS).
export function TransactionsTable({ transactions, showUser = true }: TransactionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500">
          <tr>
            {showUser && <th className="px-5 py-2 font-medium">User</th>}
            <th className="px-5 py-2 font-medium">Status</th>
            <th className="px-5 py-2 font-medium">Date (UTC)</th>
            <th className="px-5 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              {showUser && (
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/users/${transaction.user.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Avatar name={transaction.user.name} src={transaction.user.avatarUrl} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{transaction.user.name}</span>
                      <span className="block truncate text-xs text-zinc-500">{transaction.user.email}</span>
                    </span>
                  </Link>
                </td>
              )}
              <td className="px-5 py-3">
                <Badge tone={statusTone[transaction.status]}>{transaction.status}</Badge>
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-zinc-600">{formatDateTime(transaction.createdAt)}</td>
              {/* tabular-nums: digits have equal width, so amounts line up in a column. */}
              <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums">
                {formatCurrency(transaction.amountCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TransactionsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-zinc-100">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-5 py-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
