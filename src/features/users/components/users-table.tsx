"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { startTransition, useOptimistic } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteUserAction } from "../actions";
import type { UsersQuery, UsersSortField } from "../schemas";
import type { User } from "../types";
import { buildUsersHref } from "../users-url";
import { UserStatusBadge } from "./user-status-badge";

type UsersTableProps = {
  users: User[];
  query: UsersQuery;
};

// Client Component because of optimistic delete: the row must disappear BEFORE the
// server answers, so the list has to be state in the browser.
export function UsersTable({ users, query }: UsersTableProps) {
  // `users` (props from the server) is the source of truth. useOptimistic layers
  // temporary changes on top of it that only live while a transition is running.
  const [optimisticUsers, removeOptimistically] = useOptimistic(users, (current, deletedId: number) =>
    current.filter((user) => user.id !== deletedId),
  );

  function handleDelete(user: User) {
    if (!window.confirm(`Delete ${user.name}? This can't be undone.`)) return;

    startTransition(async () => {
      removeOptimistically(user.id); // 1. the row disappears immediately
      const result = await deleteUserAction(user.id); // 2. the request runs
      if (!result.ok) toast.error(result.message);
      // 3. The transition ends here and React drops the optimistic layer:
      //    - success: the action revalidated the page, the new `users` prop
      //      no longer has this user, so nothing visibly changes;
      //    - failure: `users` is unchanged, so the row comes back by itself.
      //    No manual rollback code is needed.
    });
  }

  if (optimisticUsers.length === 0) {
    // Every row on this page was just deleted; fresh data is on its way.
    return <EmptyState icon={Users} title="No users on this page" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500">
          <tr>
            <SortableHeader field="name" query={query}>
              Name
            </SortableHeader>
            <SortableHeader field="email" query={query}>
              Email
            </SortableHeader>
            <SortableHeader field="status" query={query}>
              Status
            </SortableHeader>
            <SortableHeader field="revenue" query={query} align="right">
              Revenue
            </SortableHeader>
            <SortableHeader field="createdAt" query={query}>
              Created
            </SortableHeader>
            <th className="px-4 py-2 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {optimisticUsers.map((user) => (
            // key = user.id, never the array index: after a delete or re-sort, an index
            // key would make React reuse the wrong row's DOM (e.g. a loaded image).
            <tr key={user.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3">
                <Link href={`/dashboard/users/${user.id}`} className="flex items-center gap-3 font-medium hover:underline">
                  <Avatar name={user.name} src={user.avatarUrl} />
                  <span className="whitespace-nowrap">{user.name}</span>
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-600">{user.email}</td>
              <td className="px-4 py-3">
                <UserStatusBadge status={user.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatCurrency(user.revenueCents)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{formatDate(user.createdAt)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Link
                  href={`/dashboard/users/${user.id}/edit`}
                  aria-label={`Edit ${user.name}`}
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${user.name}`}
                  onClick={() => handleDelete(user)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Text columns start A→Z; numbers and dates start with the biggest/newest,
// which is what people usually want to see first.
const DEFAULT_ORDER: Record<UsersSortField, UsersQuery["order"]> = {
  name: "asc",
  email: "asc",
  status: "asc",
  revenue: "desc",
  createdAt: "desc",
};

type SortableHeaderProps = {
  field: UsersSortField;
  query: UsersQuery;
  align?: "left" | "right";
  children: string;
};

function SortableHeader({ field, query, align = "left", children }: SortableHeaderProps) {
  const isSorted = query.sort === field;
  // Clicking the sorted column flips the order; clicking another column sorts by it.
  const nextOrder = isSorted ? (query.order === "asc" ? "desc" : "asc") : DEFAULT_ORDER[field];
  const Icon = !isSorted ? ArrowUpDown : query.order === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      aria-sort={isSorted ? (query.order === "asc" ? "ascending" : "descending") : undefined}
      className={cn("px-4 py-2 font-medium", align === "right" && "text-right")}
    >
      <Link
        href={buildUsersHref(query, { sort: field, order: nextOrder })}
        scroll={false}
        className={cn("inline-flex items-center gap-1 hover:text-zinc-900", isSorted && "text-zinc-900")}
      >
        {children}
        <Icon className={cn("size-3.5", !isSorted && "opacity-40")} aria-hidden />
      </Link>
    </th>
  );
}
