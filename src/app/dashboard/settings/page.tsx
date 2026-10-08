import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Settings",
};

// Out of scope for the task: the sidebar link exists, the page is a placeholder.
export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <Card>
        <EmptyState icon={Settings} title="Coming soon" description="Project settings will live here." />
      </Card>
    </>
  );
}
