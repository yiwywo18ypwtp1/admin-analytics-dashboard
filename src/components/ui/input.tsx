import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm placeholder:text-zinc-400",
        "focus-visible:border-zinc-900 focus-visible:outline-none",
        "aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}
