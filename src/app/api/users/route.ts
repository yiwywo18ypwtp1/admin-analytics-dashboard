import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, listUsers } from "@/features/users/data";
import { EMAIL_TAKEN_MESSAGE, parseUsersQuery, userInputSchema } from "@/features/users/schemas";
import type { User } from "@/features/users/types";
import { apiError, readJson, withApiErrors } from "@/lib/api";
import type { Paginated } from "@/lib/types";

// Route Handlers are thin adapters: HTTP in → validate → data.ts → HTTP out.

// Invalid params (?limit=9999, ?page=abc) fall back to defaults instead of 400.
// Known trade-off (README → Known trade-offs): the API shares parseUsersQuery
// with the users page, where a broken URL must never crash. A strict variant
// (same fields without .catch()) returning 400 is the option for a public API.
export const GET = withApiErrors(async (request: NextRequest) => {
  const query = parseUsersQuery(Object.fromEntries(request.nextUrl.searchParams));
  return NextResponse.json<Paginated<User>>(await listUsers(query));
});

export const POST = withApiErrors(async (request: NextRequest) => {
  const parsed = userInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid user data", z.flattenError(parsed.error).fieldErrors);
  }

  const result = await createUser(parsed.data);
  if (!result.ok) {
    return apiError(409, result.error, EMAIL_TAKEN_MESSAGE, { email: [EMAIL_TAKEN_MESSAGE] });
  }

  return NextResponse.json<User>(result.data, { status: 201 });
});
