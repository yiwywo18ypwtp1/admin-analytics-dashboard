import { UserX } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// Rendered when the page calls notFound(): an unknown id ("/users/999999")
// or one that can't be an id at all ("/users/abc"). Unlike the global 404,
// it stays inside the dashboard layout, so the sidebar is still there.
export default function UserNotFound() {
  return (
    <Card>
      <EmptyState
        icon={UserX}
        title="User not found"
        description="This user doesn't exist or has been deleted."
        action={
          <Link href="/dashboard/users" className={buttonStyles({ variant: "secondary" })}>
            Back to users
          </Link>
        }
      />
    </Card>
  );
}
