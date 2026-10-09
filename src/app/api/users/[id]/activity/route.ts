import { type NextRequest, NextResponse } from "next/server";
import { getActivity, getUser } from "@/features/users/data";
import { parseUserId } from "@/features/users/schemas";
import type { ActivityEvent } from "@/features/users/types";
import { apiError, withApiErrors } from "@/lib/api";

export const GET = withApiErrors(async (_request: NextRequest, ctx: RouteContext<"/api/users/[id]/activity">) => {
  const id = parseUserId((await ctx.params).id);
  // An unknown user is a 404, not an empty list: "no activity" and
  // "no such user" are different answers.
  const user = id === null ? null : await getUser(id);
  if (!user) return apiError(404, "NOT_FOUND", "User not found");

  return NextResponse.json<ActivityEvent[]>(await getActivity(user.id));
});
