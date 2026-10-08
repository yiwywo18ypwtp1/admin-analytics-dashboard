import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { getUserStats } from "../data";

// Async Server Component: loads its own data, so the page can stream it separately.
export async function UserStats({ userId }: { userId: number }) {
  const stats = await getUserStats(userId);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenueCents)} />
      <StatCard label="Payments" value={formatNumber(stats.paymentsCount)} />
      <StatCard
        label="Average payment"
        value={stats.paymentsCount > 0 ? formatCurrency(stats.averagePaymentCents) : "—"}
      />
      <StatCard label="Last payment" value={stats.lastPaymentAt ? formatDate(stats.lastPaymentAt) : "Never"} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}

export function UserStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-6 w-20" />
        </Card>
      ))}
    </div>
  );
}
