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
