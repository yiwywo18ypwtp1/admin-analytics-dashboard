import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Gray pulsing placeholder. Size it with className to match the real content. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-zinc-200", className)} {...props} />;
}
