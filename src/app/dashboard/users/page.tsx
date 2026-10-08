import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { UsersList } from "@/features/users/components/users-list";
import { UsersTableSkeleton } from "@/features/users/components/users-table";
import { UsersToolbar } from "@/features/users/components/users-toolbar";
import { parseUsersQuery } from "@/features/users/schemas";

export const metadata: Metadata = {
  title: "Users",
};

// The whole table state lives in the URL (?page=2&limit=25&search=john&status=active&sort=revenue&order=desc),
// so a refresh, a shared link or the Back button restores exactly the same view.
// Invalid params never crash the page: parseUsersQuery falls back to defaults.
export default async function UsersPage({ searchParams }: PageProps<"/dashboard/users">) {
  const query = parseUsersQuery(await searchParams);

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage the users of your product."
        actions={
          <Link href="/dashboard/users/new" className={buttonStyles()}>
            <Plus className="size-4" aria-hidden />
            Create user
          </Link>
        }
      />

      <Card>
        {/* Outside the keyed Suspense on purpose: if it were inside, every search would
            remount the toolbar and the input would lose focus and the typed text. */}
        <UsersToolbar query={query} />

        {/* Same trick as on Overview: a new key per query shows the skeleton while
            the next page of results loads, instead of leaving stale rows on screen. */}
        <Suspense key={JSON.stringify(query)} fallback={<UsersTableSkeleton rows={Math.min(query.limit, 10)} />}>
          <UsersList query={query} />
        </Suspense>
      </Card>
    </>
  );
}
