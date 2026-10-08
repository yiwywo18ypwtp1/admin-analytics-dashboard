import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// A styled native <select>: keyboard, screen readers and mobile pickers work out
// of the box, which a custom dropdown would have to re-implement.
export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm",
        "focus-visible:border-zinc-900 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
