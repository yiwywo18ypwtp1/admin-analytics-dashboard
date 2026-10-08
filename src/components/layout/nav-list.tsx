import { ArrowLeftRight, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  // "/dashboard" is a prefix of every page, so Overview only matches exactly.
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Plain markup without hooks (no "use client"), so it works on both sides:
 * - the server renders it without `pathname` as the Suspense fallback;
 * - SidebarNav (client) renders it with `pathname` to highlight the active link.
 */
export function NavList({ pathname }: { pathname?: string }) {
  return (
    <ul className="flex gap-1 overflow-x-auto md:flex-col">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname !== undefined && isActive(pathname, href);

        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
