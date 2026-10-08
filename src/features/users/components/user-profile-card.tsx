import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { User } from "../types";
import { UserStatusBadge } from "./user-status-badge";
import type { ReactNode } from "react";

export function UserProfileCard({ user }: { user: User }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} src={user.avatarUrl} size={64} />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.name}</p>
          <p className="truncate text-sm text-zinc-500">{user.email}</p>
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Status">
          <UserStatusBadge status={user.status} />
        </Row>
        <Row label="Role">
          <span className="capitalize">{user.role}</span>
        </Row>
        <Row label="User ID">#{user.id}</Row>
        <Row label="Created">{formatDateTime(user.createdAt)}</Row>
        <Row label="Updated">{formatDateTime(user.updatedAt)}</Row>
      </dl>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
