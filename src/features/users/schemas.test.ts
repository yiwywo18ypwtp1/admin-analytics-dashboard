import { describe, expect, it } from "vitest";
import { parseUserId, parseUsersQuery, SEARCH_MAX_LENGTH, userInputSchema, userUpdateSchema } from "./schemas";

describe("parseUsersQuery", () => {
  it("returns defaults for an empty URL", () => {
    expect(parseUsersQuery({})).toEqual({
      page: 1,
      limit: 25,
      search: "",
      status: undefined,
      sort: "createdAt",
      order: "desc",
    });
  });

  it("parses the example URL from the task", () => {
    expect(
      parseUsersQuery({ page: "2", limit: "25", search: "john", status: "active", sort: "revenue", order: "desc" }),
    ).toEqual({ page: 2, limit: 25, search: "john", status: "active", sort: "revenue", order: "desc" });
  });

  it("falls back to defaults for invalid values instead of throwing", () => {
    expect(
      parseUsersQuery({ page: "abc", limit: "9999", status: "weird", sort: "hack", order: "up" }),
    ).toEqual(parseUsersQuery({}));
  });

  it("rejects page 0, negative and fractional pages", () => {
    expect(parseUsersQuery({ page: "0" }).page).toBe(1);
    expect(parseUsersQuery({ page: "-3" }).page).toBe(1);
    expect(parseUsersQuery({ page: "2.5" }).page).toBe(1);
  });

  it("only accepts the offered page sizes", () => {
    expect(parseUsersQuery({ limit: "100" }).limit).toBe(100);
    expect(parseUsersQuery({ limit: "30" }).limit).toBe(25);
  });

  it("trims the search", () => {
    expect(parseUsersQuery({ search: "  john  " }).search).toBe("john");
  });

  it("cuts a too long search instead of dropping it (dropping would show everyone)", () => {
    const search = parseUsersQuery({ search: "z".repeat(150) }).search;
    expect(search).toBe("z".repeat(SEARCH_MAX_LENGTH));
  });

  it("ignores repeated params (?search=a&search=b)", () => {
    expect(parseUsersQuery({ search: ["a", "b"] }).search).toBe("");
  });
});

describe("userInputSchema", () => {
  const valid = { name: "Jane Doe", email: "jane@example.com", role: "editor", status: "active" };

  it("accepts valid input and normalizes the email", () => {
    const result = userInputSchema.safeParse({ ...valid, email: "  Jane@Example.COM " });
    expect(result.success && result.data.email).toBe("jane@example.com");
  });

  it("requires a name of 2–100 characters", () => {
    expect(userInputSchema.safeParse({ ...valid, name: "J" }).success).toBe(false);
    expect(userInputSchema.safeParse({ ...valid, name: "J".repeat(101) }).success).toBe(false);
    expect(userInputSchema.safeParse({ ...valid, name: "  Jo  " }).success).toBe(true);
  });

  it("rejects an invalid email, role or status", () => {
    expect(userInputSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(userInputSchema.safeParse({ ...valid, role: "god" }).success).toBe(false);
    expect(userInputSchema.safeParse({ ...valid, status: "deleted" }).success).toBe(false);
  });

  it("treats an empty avatar field as 'no avatar' and only allows https URLs", () => {
    const empty = userInputSchema.safeParse({ ...valid, avatarUrl: "" });
    expect(empty.success && empty.data.avatarUrl).toBe(null);
    expect(userInputSchema.safeParse({ ...valid, avatarUrl: "http://x.com/a.png" }).success).toBe(false);
    expect(userInputSchema.safeParse({ ...valid, avatarUrl: "https://x.com/a.png" }).success).toBe(true);
  });
});

describe("userUpdateSchema", () => {
  it("allows partial updates but not an empty body", () => {
    expect(userUpdateSchema.safeParse({ status: "banned" }).success).toBe(true);
    expect(userUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe("parseUserId", () => {
  it("accepts positive integers only", () => {
    expect(parseUserId("42")).toBe(42);
    expect(parseUserId("abc")).toBe(null);
    expect(parseUserId("0")).toBe(null);
    expect(parseUserId("-1")).toBe(null);
    expect(parseUserId("1.5")).toBe(null);
  });
});
