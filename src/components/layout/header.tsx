import { Suspense } from "react";
import { PeriodSwitcher } from "@/features/analytics/components/period-switcher";
import { CURRENT_PROJECT } from "@/lib/config";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-200 bg-white px-4 py-2 md:px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Project</span>
        <span className="font-medium">{CURRENT_PROJECT.name}</span>
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">{CURRENT_PROJECT.plan}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* useSearchParams() needs the request, so it's wrapped in Suspense:
            the rest of the header is still prerendered. */}
        <Suspense fallback={null}>
          <PeriodSwitcher />
        </Suspense>
        <UserMenu />
      </div>
    </header>
  );
}
