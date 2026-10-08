import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { UserStatus } from "../types";

const statusTone: Record<UserStatus, BadgeTone> = {
  active: "success",
  inactive: "neutral",
  banned: "danger",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
}
