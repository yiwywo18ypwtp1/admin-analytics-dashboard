import { ArrowDown, ArrowUp, ArrowUpDown, Pencil } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";
import type { UsersQuery, UsersSortField } from "../schemas";
import type { User } from "../types";
import { buildUsersHref } from "../users-url";
import { UserStatusBadge } from "./user-status-badge";

type UsersTableProps = {
  users: User[];
  query: UsersQuery;
};

// Server Component for now: sorting is done with links, so the table needs no JS.
// It becomes a Client Component in step 3.6, when optimistic delete needs useOptimistic.
export function UsersTable({ users, query }: UsersTableProps) {
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
          {users.map((user) => (
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
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/users/${user.id}/edit`}
                  aria-label={`Edit ${user.name}`}
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
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
