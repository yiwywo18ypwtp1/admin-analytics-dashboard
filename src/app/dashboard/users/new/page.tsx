import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createUserAction } from "@/features/users/actions";
import { UserForm } from "@/features/users/components/user-form";

export const metadata: Metadata = {
  title: "Create user",
};

// "new" is a static segment, so Next matches it before the dynamic [id] route.
export default function NewUserPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Create user" description="Add a new user to the project." />
      <Card className="p-6">
        {/* A Server Action can be passed from a Server Component to a Client
            Component as a prop: the client only gets a reference to call it. */}
        <UserForm action={createUserAction} />
      </Card>
    </div>
  );
}
