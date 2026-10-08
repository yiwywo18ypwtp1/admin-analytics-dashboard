import { CreditCard, History, LogIn, type LucideIcon, Pencil, ShieldAlert, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { getActivity } from "../data";
import type { ActivityType } from "../types";
import type { ReactNode } from "react";

const activityIcons: Record<ActivityType, LucideIcon> = {
  account_created: UserPlus,
  profile_updated: Pencil,
  status_changed: ShieldAlert,
  login: LogIn,
  payment: CreditCard,
};

export async function ActivityTimeline({ userId }: { userId: number }) {
  const events = await getActivity(userId);

  return (
    <TimelineCard>
      {events.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" className="py-10" />
      ) : (
        <ol className="px-5 pb-5">
          {events.map((event, index) => {
            const Icon = activityIcons[event.type];
            const isLast = index === events.length - 1;

            return (
              <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                {/* Vertical line connecting the icons; not drawn after the last event. */}
                {!isLast && <span aria-hidden className="absolute top-8 bottom-0 left-4 w-px bg-zinc-200" />}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <Icon className="size-4 text-zinc-600" aria-hidden />
                </span>
                <div className="pt-1">
                  <p className="text-sm font-medium">{event.message}</p>
                  <time dateTime={event.createdAt} className="text-xs text-zinc-500">
                    {formatDateTime(event.createdAt)} UTC
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </TimelineCard>
  );
}

export function ActivityTimelineSkeleton() {
  return (
    <TimelineCard>
      <div className="space-y-5 px-5 pb-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </TimelineCard>
  );
}

function TimelineCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <h2 className="px-5 pt-5 pb-4 text-base font-semibold">Activity</h2>
      {children}
    </Card>
  );
}
