import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { updateUserAction } from "@/features/users/actions";
import { UserForm } from "@/features/users/components/user-form";
import { getUser } from "@/features/users/data";
import { parseUserId } from "@/features/users/schemas";

type Props = PageProps<"/dashboard/users/[id]/edit">;

async function findUser(params: Props["params"]) {
  const id = parseUserId((await params).id);
  return id === null ? null : getUser(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await findUser(params);
  return { title: user ? `Edit ${user.name}` : "User not found" };
}

export default async function EditUserPage({ params }: Props) {
  const user = await findUser(params);
  // Uses the not-found.tsx of the parent [id] segment.
  if (!user) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Edit ${user.name}`} description={user.email} />
      <Card className="p-6">
        {/* bind() pre-fills the first argument (the id), so the same UserForm can call
            either action with just (state, formData). The id still comes from a
            request, so with real auth the action would check the user may edit it. */}
        <UserForm action={updateUserAction.bind(null, user.id)} user={user} />
      </Card>
    </div>
  );
}
