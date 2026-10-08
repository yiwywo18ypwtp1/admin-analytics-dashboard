"use client"; // Error boundaries must be Client Components (React requirement).

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// A more specific version of dashboard/error.tsx: besides "Try again" it offers
// a way back to the users list, which is what the user most likely wants here.
export default function UserError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <EmptyState
        icon={TriangleAlert}
        title="Couldn't load this user"
        description={error.digest ? `Error ID: ${error.digest}` : "Please try again."}
        action={
          <div className="flex gap-2">
            <Button onClick={retry}>
              <RotateCcw className="size-4" aria-hidden />
              Try again
            </Button>
            <Link href="/dashboard/users" className={buttonStyles({ variant: "secondary" })}>
              Back to users
            </Link>
          </div>
        }
      />
    </Card>
  );
}
