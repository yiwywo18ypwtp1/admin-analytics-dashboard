import { z } from "zod";
import { USER_ROLES, USER_STATUSES } from "./types";

// ---------------------------------------------------------------------------
// User input: shared by the form (client), Server Actions and Route Handlers.
// Format rules live here. Rules that need the DB (unique email) live in data.ts.
// ---------------------------------------------------------------------------

export const EMAIL_TAKEN_MESSAGE = "A user with this email already exists";

// An empty form field means "no avatar".
const avatarUrlSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.url({ protocol: /^https$/, message: "Avatar must be an https:// URL" }).nullable(),
);

export const userInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address")),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
  avatarUrl: avatarUrlSchema.optional(),
});

// PATCH: every field is optional, but an empty body makes no sense.
export const userUpdateSchema = userInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, "Nothing to update");

export type UserInput = z.infer<typeof userInputSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// ---------------------------------------------------------------------------
// Users table URL state: ?page=2&limit=25&search=john&status=active&sort=revenue&order=desc
// Every field uses .catch(), so invalid or missing params fall back to defaults
// instead of throwing. Parsing a URL can never crash the page.
// ---------------------------------------------------------------------------

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const SEARCH_MAX_LENGTH = 100;
export const USERS_SORT_FIELDS = ["name", "email", "status", "revenue", "createdAt"] as const;
export type UsersSortField = (typeof USERS_SORT_FIELDS)[number];

export const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().pipe(z.literal(PAGE_SIZES)).catch(25),
  // Too long → cut, not dropped: falling back to "" would mean "no filter", the
  // opposite of what the user typed. Only a non-string (e.g. ?search=a&search=b) becomes "".
  search: z
    .string()
    .catch("")
    .transform((value) => value.trim().slice(0, SEARCH_MAX_LENGTH).trim()),
  status: z.enum(USER_STATUSES).optional().catch(undefined),
  sort: z.enum(USERS_SORT_FIELDS).catch("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseUsersQuery(searchParams: RawSearchParams): UsersQuery {
  return usersQuerySchema.parse(searchParams);
}

// "/users/abc" or "/users/-1" can never match a user, so they're treated as not found.
export function parseUserId(raw: string): number | null {
  const result = z.coerce.number().int().positive().safeParse(raw);
  return result.success ? result.data : null;
}
