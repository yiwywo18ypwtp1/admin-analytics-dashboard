import { SearchX, Users } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listUsers } from "../data";
import type { UsersQuery } from "../schemas";
import { buildUsersHref, hasActiveFilters } from "../users-url";
import { UsersPagination } from "./users-pagination";
import { UsersTable } from "./users-table";

// Async Server Component: loads one page of users and decides what to show.
export async function UsersList({ query }: { query: UsersQuery }) {
  const result = await listUsers(query);

  if (result.total === 0) {
    return hasActiveFilters(query) ? (
      <EmptyState
        icon={SearchX}
        title="No users found."
        description="Try a different search or status filter."
        action={
          <Link href={buildUsersHref(query, { search: "", status: undefined })} className={buttonStyles({ variant: "secondary" })}>
            Clear filters
          </Link>
        }
      />
    ) : (
      <EmptyState icon={Users} title="No users yet" description="Users you create will appear here." />
    );
  }

  // e.g. ?page=999 from an old bookmark, or the last page became empty after deletions.
  if (result.items.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="This page doesn't exist"
        description={`There are only ${result.totalPages} pages of results.`}
        action={
          <Link href={buildUsersHref(query, { page: 1 })} className={buttonStyles({ variant: "secondary" })}>
            Go to first page
          </Link>
        }
      />
    );
  }

  return (
    <>
      <UsersTable users={result.items} query={query} />
      <UsersPagination result={result} query={query} />
    </>
  );
}
