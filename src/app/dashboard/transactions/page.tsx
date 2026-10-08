import { ArrowLeftRight } from "lucide-react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Transactions",
};

// Out of scope for the task: the sidebar link exists, the page is a placeholder.
export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" />
      <Card>
        <EmptyState
          icon={ArrowLeftRight}
          title="Coming soon"
          description="Recent transactions are available on the Overview page and on each user's page."
        />
      </Card>
    </>
  );
}
