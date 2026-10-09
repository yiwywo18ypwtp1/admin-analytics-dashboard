import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityTimelineSkeleton } from "@/features/users/components/activity-timeline";
import { UserStatsSkeleton } from "@/features/users/components/user-stats";
import { RecentTransactionsSkeleton } from "@/features/transactions/components/recent-transactions";

// Shown while the page loads the user (needed before anything else, to decide on notFound()).
// Side effect: streaming starts before notFound() can run, so an unknown user gets
// HTTP 200 instead of 404. Deliberate, see the comment in page.tsx.
export default function UserLoading() {
  return (
    <>
      <Skeleton className="mb-4 h-8 w-32" />
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <UserStatsSkeleton />
          <RecentTransactionsSkeleton />
          <ActivityTimelineSkeleton />
        </div>
      </div>
    </>
  );
}
