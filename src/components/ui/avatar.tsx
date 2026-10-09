"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { OPTIMIZED_IMAGE_HOSTS } from "@/lib/config";
import { getInitials } from "@/lib/format";

type AvatarProps = {
  name: string;
  src: string | null;
  size?: number;
  className?: string;
};

function isOptimizedHost(src: string): boolean {
  // URL.canParse instead of new URL(): a malformed URL must not crash the render.
  return URL.canParse(src) && OPTIMIZED_IMAGE_HOSTS.includes(new URL(src).hostname);
}

// Client Component only because of onError: if the image URL is broken (404,
// deleted image, not an image), fall back to initials instead of a broken-image icon.
// Event handlers like onError can't run in Server Components.
export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  // Remembers WHICH url failed, not just "failed": when `src` changes (e.g. the
  // avatar preview in the form), the new url gets a fresh try automatically.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const style = { width: size, height: size };

  if (!src || src === failedSrc) {
    return (
      <span
        aria-hidden
        style={style}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600",
          className,
        )}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      // Fixed width/height: the browser reserves space before the image loads (no layout
      // shift), and Next serves a resized file instead of the original 150px+ image.
      width={size}
      height={size}
      // next/image only optimizes hosts listed in next.config.ts. A user can save any
      // https URL as an avatar, so unknown hosts are loaded as-is instead of failing.
      unoptimized={!isOptimizedHost(src)}
      onError={() => setFailedSrc(src)}
      style={style}
      className={cn("shrink-0 rounded-full bg-zinc-200 object-cover", className)}
    />
  );
}
