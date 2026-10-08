import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonStyles } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Paginated } from "@/lib/types";
import type { UsersQuery } from "../schemas";
import type { User } from "../types";
import { buildUsersHref } from "../users-url";

type UsersPaginationProps = {
  result: Paginated<User>;
  query: UsersQuery;
};

// Server Component: Prev/Next are plain links built from the query, so no JS is
// needed. They even work before the page has hydrated.
export function UsersPagination({ result, query }: UsersPaginationProps) {
  const { page, limit, total, totalPages } = result;
  const firstRow = (page - 1) * limit + 1;
  const lastRow = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 text-sm">
      <p className="text-zinc-500">
        Showing <span className="font-medium text-zinc-900">{formatNumber(firstRow)}</span>–
        <span className="font-medium text-zinc-900">{formatNumber(lastRow)}</span> of{" "}
        <span className="font-medium text-zinc-900">{formatNumber(total)}</span>
      </p>

      <div className="flex items-center gap-2">
        <PageLink query={query} page={page - 1} disabled={page <= 1} label="Previous page">
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </PageLink>
        <span className="px-2 text-zinc-500">
          Page {formatNumber(page)} of {formatNumber(totalPages)}
        </span>
        <PageLink query={query} page={page + 1} disabled={page >= totalPages} label="Next page">
          Next
          <ChevronRight className="size-4" aria-hidden />
        </PageLink>
      </div>
    </nav>
  );
}

type PageLinkProps = {
  query: UsersQuery;
  page: number;
  disabled: boolean;
  label: string;
  children: ReactNode;
};

function PageLink({ query, page, disabled, label, children }: PageLinkProps) {
  const className = buttonStyles({ variant: "secondary", size: "sm" });

  // A link can't be disabled, so the unavailable direction is a plain inactive element.
  if (disabled) {
    return (
      <span aria-disabled className={`${className} pointer-events-none opacity-50`}>
        {children}
      </span>
    );
  }

  return (
    <Link href={buildUsersHref(query, { page })} aria-label={label} className={className}>
      {children}
    </Link>
  );
}
