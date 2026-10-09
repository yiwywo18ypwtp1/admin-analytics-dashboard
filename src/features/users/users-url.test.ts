import { describe, expect, it } from "vitest";
import { parseUsersQuery } from "./schemas";
import { buildUsersHref, hasActiveFilters } from "./users-url";

const defaults = parseUsersQuery({});

describe("buildUsersHref", () => {
  it("leaves default values out of the URL", () => {
    expect(buildUsersHref(defaults)).toBe("/dashboard/users");
  });

  it("builds the URL from the task in the same parameter order", () => {
    const query = { ...defaults, page: 2, search: "john", status: "active" as const, sort: "revenue" as const };
    expect(buildUsersHref(query, { page: 2 })).toBe(
      "/dashboard/users?page=2&search=john&status=active&sort=revenue",
    );
  });

  it("resets to page 1 when anything other than the page changes", () => {
    const onPage5 = { ...defaults, page: 5 };
    expect(buildUsersHref(onPage5, { search: "john" })).toBe("/dashboard/users?search=john");
    expect(buildUsersHref(onPage5, { sort: "name", order: "asc" })).toBe("/dashboard/users?sort=name&order=asc");
  });

  it("keeps filters when only the page changes", () => {
    const filtered = { ...defaults, search: "john", limit: 50 as const };
    expect(buildUsersHref(filtered, { page: 3 })).toBe("/dashboard/users?page=3&limit=50&search=john");
  });

  it("can clear filters while keeping sort and page size", () => {
    const query = { ...defaults, search: "x", status: "banned" as const, limit: 10 as const, sort: "name" as const };
    expect(buildUsersHref(query, { search: "", status: undefined })).toBe("/dashboard/users?limit=10&sort=name");
  });

  it("encodes special characters in the search", () => {
    expect(buildUsersHref(defaults, { search: "a&b c" })).toBe("/dashboard/users?search=a%26b+c");
  });
});

describe("hasActiveFilters", () => {
  it("is true only when search or status narrows the list", () => {
    expect(hasActiveFilters(defaults)).toBe(false);
    expect(hasActiveFilters({ ...defaults, sort: "name" })).toBe(false);
    expect(hasActiveFilters({ ...defaults, search: "x" })).toBe(true);
    expect(hasActiveFilters({ ...defaults, status: "active" })).toBe(true);
  });
});
