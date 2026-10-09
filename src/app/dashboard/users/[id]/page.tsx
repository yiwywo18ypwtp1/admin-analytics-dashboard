import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { RecentTransactions, RecentTransactionsSkeleton } from "@/features/transactions/components/recent-transactions";
import { ActivityTimeline, ActivityTimelineSkeleton } from "@/features/users/components/activity-timeline";
import { BackToUsersButton } from "@/features/users/components/back-to-users-button";
import { UserProfileCard } from "@/features/users/components/user-profile-card";
import { UserStats, UserStatsSkeleton } from "@/features/users/components/user-stats";
import { getUser } from "@/features/users/data";
import { parseUserId } from "@/features/users/schemas";

type Props = PageProps<"/dashboard/users/[id]">;

// Shared by generateMetadata and the page. getUser is wrapped in React cache(),
// so both calls together hit the database once.
async function findUser(params: Props["params"]) {
  const id = parseUserId((await params).id);
  return id === null ? null : getUser(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await findUser(params);
  return { title: user ? user.name : "User not found" };
}

export default async function UserPage({ params }: Props) {
  const user = await findUser(params);
  // "/users/abc" and "/users/999999" both end up here and render not-found.tsx.
  // Known trade-off (README → Known trade-offs): the HTTP status is 200, not 404.
  // loading.tsx has already streamed the skeleton, and the status code went out
  // with it. Removing loading.tsx would give a real 404 but a blank screen while
  // the user loads; for a noindex admin panel the visible UI matters more.
  if (!user) notFound();

  return (
    <>
      <BackToUsersButton />
      <PageHeader
        title={user.name}
        description={user.email}
        actions={
          <Link href={`/dashboard/users/${user.id}/edit`} className={buttonStyles({ variant: "secondary" })}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile data is already loaded (we needed it for notFound), so it renders at once. */}
        <div className="space-y-6">
          <UserProfileCard user={user} />
        </div>

        {/* Each section loads its own data in its own Suspense: a slow one
            doesn't hold back the others. */}
        <div className="space-y-6 lg:col-span-2">
          <Suspense fallback={<UserStatsSkeleton />}>
            <UserStats userId={user.id} />
          </Suspense>
          <Suspense fallback={<RecentTransactionsSkeleton />}>
            <RecentTransactions userId={user.id} />
          </Suspense>
          <Suspense fallback={<ActivityTimelineSkeleton />}>
            <ActivityTimeline userId={user.id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
