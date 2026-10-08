import { Skeleton } from "@/components/ui/skeleton";

// Separate file from UsersTable: the table is a Client Component, the skeleton
// has no interactivity and stays a Server Component.
export function UsersTableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="divide-y divide-zinc-100">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="hidden h-4 flex-1 sm:block" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
