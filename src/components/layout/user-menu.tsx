"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { CURRENT_ADMIN } from "@/lib/config";
import { getInitials } from "@/lib/format";

// Client Component because a dropdown needs state: open/close, closing on an
// outside click and on Escape. (A native <details> can't close on outside click.)
export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-zinc-100"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
          {getInitials(CURRENT_ADMIN.name)}
        </span>
        <span className="hidden font-medium sm:inline">{CURRENT_ADMIN.name}</span>
        <ChevronDown className="size-4 text-zinc-500" aria-hidden />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute right-0 z-20 mt-2 w-60 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{CURRENT_ADMIN.name}</p>
            <p className="text-xs text-zinc-500">{CURRENT_ADMIN.email}</p>
            <p className="mt-1 text-xs text-zinc-500">Role: {CURRENT_ADMIN.role}</p>
          </div>
          <hr className="my-1 border-zinc-200" />
          {/* There is no auth in this app, so signing out is not available. */}
          <button
            type="button"
            disabled
            title="Authentication is not part of this demo"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
