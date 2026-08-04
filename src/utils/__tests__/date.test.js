import { describe, it, expect } from "vitest";
import { formatDate } from "../date";

describe("date utility (formatDate)", () => {
  it("formats a valid Date object or date string correctly", () => {
    const result = formatDate("2026-08-04T10:00:00Z");
    expect(result).toBe("2026/08/04");
  });

  it("supports custom date format strings", () => {
    const result = formatDate("2026-01-15T00:00:00Z", "YYYY-MM-DD");
    expect(result).toBe("2026-01-15");
  });

  it("returns empty string for invalid date input", () => {
    expect(formatDate("invalid-date-string")).toBe("");
    expect(formatDate(null)).toBe("");
  });
});
