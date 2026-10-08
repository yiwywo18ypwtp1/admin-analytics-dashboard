import { ArrowLeftRight, DollarSign, Percent, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPercent, formatWholeCurrency } from "@/lib/format";
import type { Analytics } from "../types";

export function KpiCards({ analytics }: { analytics: Analytics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Revenue" value={formatWholeCurrency(analytics.revenueCents)} icon={DollarSign} />
      <KpiCard label="Active users" value={formatNumber(analytics.activeUsers)} icon={Users} />
      <KpiCard label="Transactions" value={formatNumber(analytics.transactionsCount)} icon={ArrowLeftRight} />
      <KpiCard
        label="Conversion rate"
        value={formatPercent(analytics.conversionRate)}
        icon={Percent}
        hint="Active users who paid"
      />
    </div>
  );
}

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
};

function KpiCard({ label, value, icon: Icon, hint }: KpiCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        {label}
        <Icon className="size-4" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </Card>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-7 w-32" />
        </Card>
      ))}
    </div>
  );
}
