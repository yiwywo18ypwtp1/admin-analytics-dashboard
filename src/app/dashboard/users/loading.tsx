import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersTableSkeleton } from "@/features/users/components/users-table-skeleton";

// Shown on the first visit to /dashboard/users, while the page reads the URL.
// Later changes (search, sort, pages) only reload the table via the Suspense in page.tsx.
export default function UsersLoading() {
  return (
    <>
      <PageHeader title="Users" description="Manage the users of your product." />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-zinc-200 p-4">
          <Skeleton className="h-9 w-full sm:w-72" />
          <Skeleton className="h-9 w-32" />
        </div>
        <UsersTableSkeleton rows={10} />
      </Card>
    </>
  );
}
