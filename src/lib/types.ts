export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Result of a mutation with an *expected* failure (e.g. duplicate email).
 * Unexpected failures (DB down, bugs) are thrown instead.
 */
export type MutationResult<T, E extends string = never> =
  | { ok: true; data: T }
  | { ok: false; error: E };
