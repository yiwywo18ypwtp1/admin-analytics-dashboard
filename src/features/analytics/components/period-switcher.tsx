"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { PERIOD_PRESETS, type PeriodPreset, parsePeriod } from "../schemas";

const PRESET_LABELS: Record<PeriodPreset, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  custom: "Custom",
};

// Client Component: reads the URL and changes it on click.
// The URL is the only source of truth for the period. This component doesn't
// keep the selected period in state, it derives it from the URL on every render.
export function PeriodSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Only the "Custom" inputs being open is local UI state: it isn't in the URL
  // until the user applies a range.
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // It lives in the shared header but only means something on the Overview page.
  if (pathname !== "/dashboard") return null;

  // Same parser as the server, so both always agree on the period (including fallbacks).
  const period = parsePeriod(Object.fromEntries(searchParams));
  const showCustom = isCustomOpen || period.preset === "custom";

  function navigate(params: Record<string, string>) {
    // push (not replace): each period is a separate history entry, so Back returns to the previous one.
    // scroll: false: keep the scroll position, only the data below changes.
    router.push(`/dashboard?${new URLSearchParams(params)}`, { scroll: false });
  }

  function selectPreset(preset: PeriodPreset) {
    if (preset === "custom") {
      setIsCustomOpen(true);
      return;
    }
    setIsCustomOpen(false);
    navigate({ period: preset });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Period" className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5">
        {PERIOD_PRESETS.map((preset) => {
          const isActive = preset === "custom" ? showCustom : !showCustom && period.preset === preset;

          return (
            <button
              key={preset}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectPreset(preset)}
              className={cn(
                "rounded px-3 py-1 text-sm font-medium transition-colors",
                isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {PRESET_LABELS[preset]}
            </button>
          );
        })}
      </div>

      {showCustom && (
        <CustomRangeForm
          // A new key when the URL range changes (e.g. browser Back) resets the
          // inputs to the new values instead of keeping stale local state.
          key={`${period.from}:${period.to}`}
          initialFrom={period.from}
          initialTo={period.to}
          onApply={(from, to) => navigate({ period: "custom", from, to })}
        />
      )}
    </div>
  );
}

type CustomRangeFormProps = {
  initialFrom: string;
  initialTo: string;
  onApply: (from: string, to: string) => void;
};

function CustomRangeForm({ initialFrom, initialTo, onApply }: CustomRangeFormProps) {
  // Draft values: the URL only changes when the user clicks Apply, not on every keystroke.
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const today = new Date().toISOString().slice(0, 10);
  const isValid = from !== "" && to !== "" && from <= to;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isValid) onApply(from, to);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="date"
        aria-label="From"
        value={from}
        max={to || today}
        onChange={(event) => setFrom(event.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm"
      />
      <span className="text-sm text-zinc-500">–</span>
      <input
        type="date"
        aria-label="To"
        value={to}
        min={from}
        max={today}
        onChange={(event) => setTo(event.target.value)}
        className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-sm"
      />
      <Button type="submit" size="sm" disabled={!isValid}>
        Apply
      </Button>
    </form>
  );
}
