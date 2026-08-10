import { describe, it, expect } from "vitest";
import { getTagStyles } from "../tagStyles";

describe("tagStyles utility (getTagStyles)", () => {
  it("returns specific styles for predefined tags", () => {
    const apiStyle = getTagStyles("API");
    expect(apiStyle.text).toBe("text-[#00FFFF]");

    const reactStyle = getTagStyles("#React");
    expect(reactStyle.text).toBe("text-[#FF00FF]");

    const sqlStyle = getTagStyles("Database");
    expect(sqlStyle.text).toBe("text-[#FFD700]");

    const securityStyle = getTagStyles("Security ");
    expect(securityStyle.text).toBe("text-[#39FF14]");
  });

  it("returns calculated hash fallback style for custom tags", () => {
    const customStyle = getTagStyles("CustomTag123");
    expect(customStyle).toHaveProperty("bg");
    expect(customStyle).toHaveProperty("border");
    expect(customStyle).toHaveProperty("text");
  });
});
