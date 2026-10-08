import Image from "next/image";
import { cn } from "@/lib/cn";
import { OPTIMIZED_IMAGE_HOSTS } from "@/lib/config";
import { getInitials } from "@/lib/format";

type AvatarProps = {
  name: string;
  src: string | null;
  size?: number;
  className?: string;
};

// No hooks, so it works in both Server and Client Components (users table is a Client Component).
export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const style = { width: size, height: size };

  if (!src) {
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
      unoptimized={!OPTIMIZED_IMAGE_HOSTS.includes(new URL(src).hostname)}
      style={style}
      className={cn("shrink-0 rounded-full bg-zinc-200 object-cover", className)}
    />
  );
}
