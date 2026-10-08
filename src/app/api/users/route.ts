import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, listUsers } from "@/features/users/data";
import { EMAIL_TAKEN_MESSAGE, parseUsersQuery, userInputSchema } from "@/features/users/schemas";
import type { User } from "@/features/users/types";
import { apiError, readJson } from "@/lib/api";
import type { Paginated } from "@/lib/types";

// Route Handlers are thin adapters: HTTP in → validate → data.ts → HTTP out.

export async function GET(request: NextRequest) {
  const query = parseUsersQuery(Object.fromEntries(request.nextUrl.searchParams));
  return NextResponse.json<Paginated<User>>(await listUsers(query));
}

export async function POST(request: NextRequest) {
  const parsed = userInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid user data", z.flattenError(parsed.error).fieldErrors);
  }

  const result = await createUser(parsed.data);
  if (!result.ok) {
    return apiError(409, result.error, EMAIL_TAKEN_MESSAGE, { email: [EMAIL_TAKEN_MESSAGE] });
  }

  return NextResponse.json<User>(result.data, { status: 201 });
}
