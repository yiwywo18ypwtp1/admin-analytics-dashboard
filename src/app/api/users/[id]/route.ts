import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ANALYTICS_CACHE_TAG } from "@/features/analytics/data";
import { deleteUser, getUser, updateUser } from "@/features/users/data";
import { EMAIL_TAKEN_MESSAGE, parseUserId, userUpdateSchema } from "@/features/users/schemas";
import type { User } from "@/features/users/types";
import { apiError, readJson } from "@/lib/api";

const userNotFound = () => apiError(404, "NOT_FOUND", "User not found");

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  const id = parseUserId((await ctx.params).id);
  if (id === null) return userNotFound();

  const user = await getUser(id);
  if (!user) return userNotFound();

  return NextResponse.json<User>(user);
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  const id = parseUserId((await ctx.params).id);
  if (id === null) return userNotFound();

  const parsed = userUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid user data", z.flattenError(parsed.error).fieldErrors);
  }

  const result = await updateUser(id, parsed.data);
  if (!result.ok) {
    switch (result.error) {
      case "NOT_FOUND":
        return userNotFound();
      case "EMAIL_TAKEN":
        return apiError(409, "EMAIL_TAKEN", EMAIL_TAKEN_MESSAGE, { email: [EMAIL_TAKEN_MESSAGE] });
    }
  }

  return NextResponse.json<User>(result.data);
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  const id = parseUserId((await ctx.params).id);
  if (id === null) return userNotFound();

  const result = await deleteUser(id);
  if (!result.ok) return userNotFound();

  // The user's transactions were deleted too, so cached analytics are outdated.
  // updateTag only works in Server Actions; Route Handlers use revalidateTag.
  revalidateTag(ANALYTICS_CACHE_TAG, "max");

  return new Response(null, { status: 204 });
}
