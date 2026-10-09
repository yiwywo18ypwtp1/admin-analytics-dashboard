import { describe, expect, it } from "vitest";
import { escapeLike } from "./escape-like";

describe("escapeLike", () => {
  it("leaves normal text untouched", () => {
    expect(escapeLike("john")).toBe("john");
  });

  it("escapes LIKE wildcards so they match literally", () => {
    expect(escapeLike("%")).toBe("\\%");
    expect(escapeLike("_")).toBe("\\_");
    expect(escapeLike("50%_off")).toBe("50\\%\\_off");
  });

  it("escapes the escape character itself", () => {
    expect(escapeLike("a\\b")).toBe("a\\\\b");
  });
});
