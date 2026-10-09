import { describe, expect, it, vi } from "vitest";
import { withApiErrors } from "./api";

describe("withApiErrors", () => {
  it("passes the handler's response through", async () => {
    const handler = withApiErrors(async () => Response.json({ ok: true }, { status: 201 }));
    const response = await handler();
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("turns an unexpected error into a JSON 500 with the documented error shape", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // keep test output clean
    const handler = withApiErrors(async () => {
      throw new Error("SQLITE_ERROR: no such table: users");
    });

    const response = await handler();
    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toContain("application/json");
    const body = await response.json();
    expect(body).toEqual({ error: { code: "INTERNAL", message: "Something went wrong. Please try again." } });
    // Internal details must not leak to API clients.
    expect(JSON.stringify(body)).not.toContain("SQLITE");
  });
});
