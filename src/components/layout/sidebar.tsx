import { ChartNoAxesCombined } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { APP_NAME } from "@/lib/config";
import { NavList } from "./nav-list";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  return (
    <aside className="border-b border-zinc-200 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
      <Link href="/dashboard" className="flex h-14 items-center gap-2 px-5 font-semibold">
        <ChartNoAxesCombined className="size-5" aria-hidden />
        {APP_NAME}
      </Link>

      <nav aria-label="Main" className="px-3 pb-3">
        {/* On routes with an unknown dynamic param (/users/[id]) usePathname() suspends
            during prerendering. The fallback is the same nav without the active
            highlight, so the rest of the layout can still be prerendered. */}
        <Suspense fallback={<NavList />}>
          <SidebarNav />
        </Suspense>
      </nav>
    </aside>
  );
}
