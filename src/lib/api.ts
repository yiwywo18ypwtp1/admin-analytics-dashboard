import { NextResponse } from "next/server";

/** Shape of every error response from /api/*. */
export type ApiError = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
  };
};

export function apiError(
  status: number,
  code: string,
  message: string,
  fieldErrors?: ApiError["error"]["fieldErrors"],
) {
  return NextResponse.json<ApiError>({ error: { code, message, fieldErrors } }, { status });
}

/** request.json() throws on an empty or malformed body; treat that as "no body". */
export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

/**
 * Wraps a Route Handler so unexpected errors (DB down, bugs) still return the
 * documented error shape instead of Next's empty 500. Expected errors (400/404/409)
 * are returned by the handler itself; this only catches what was thrown.
 *
 *   export const GET = withApiErrors(async (request) => { … });
 */
export function withApiErrors<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Logged with details on the server; the client gets a generic message,
      // so internal details (SQL, file paths) never leak through the API.
      console.error(error);
      return apiError(500, "INTERNAL", "Something went wrong. Please try again.");
    }
  };
}
