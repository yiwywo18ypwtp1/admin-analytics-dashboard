import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Page not found",
};

// Shown for any URL that doesn't match a route.
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Link href="/dashboard" className={buttonStyles()}>
            Go to dashboard
          </Link>
        }
      />
    </main>
  );
}
