"use client"; // Error boundaries must be Client Components (React requirement).

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// Lives inside dashboard/layout.tsx, so when a page crashes the sidebar and
// header stay usable and only the page area shows this message.
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // The place to report to Sentry or similar in a real app.
    console.error(error);
  }, [error]);

  return (
    <Card>
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        // In production, server error messages are hidden; the digest links this
        // screen to the matching entry in the server logs.
        description={error.digest ? `Error ID: ${error.digest}` : "Please try again."}
        action={
          // retry() re-fetches the page from the server, unlike reset(),
          // which only re-renders what the client already has.
          <Button onClick={retry}>
            <RotateCcw className="size-4" aria-hidden />
            Try again
          </Button>
        }
      />
    </Card>
  );
}
