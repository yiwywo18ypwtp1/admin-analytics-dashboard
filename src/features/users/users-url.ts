import { type UsersQuery, usersQuerySchema } from "./schemas";

// Builds users-table URLs. Used on the server (pagination and sort links) and on
// the client (search, filters), so every control produces URLs the same way.

// Every field of usersQuerySchema has .catch(), so parsing {} gives the defaults.
const DEFAULT_QUERY = usersQuerySchema.parse({});

// Order matches the URL from the task: ?page=2&limit=25&search=john&status=active&sort=revenue&order=desc
const PARAM_ORDER = ["page", "limit", "search", "status", "sort", "order"] as const;

/**
 * Returns the users page URL for `query` with `changes` applied.
 * - Any change other than `page` resets to page 1: page 7 of the old results
 *   means nothing for a new search or sort.
 * - Default values are left out to keep URLs short: "/dashboard/users", not "?page=1&limit=25…".
 */
export function buildUsersHref(query: UsersQuery, changes: Partial<UsersQuery> = {}): string {
  const next: UsersQuery = { ...query, ...changes };
  if (!("page" in changes)) next.page = 1;

  const params = new URLSearchParams();
  for (const key of PARAM_ORDER) {
    const value = next[key];
    if (value !== undefined && value !== "" && value !== DEFAULT_QUERY[key]) {
      params.set(key, String(value));
    }
  }

  const search = params.toString();
  return search ? `/dashboard/users?${search}` : "/dashboard/users";
}

/** Did the user narrow the list down? Decides between "No users found" and "No users yet". */
export function hasActiveFilters(query: UsersQuery): boolean {
  return query.search !== "" || query.status !== undefined;
}
