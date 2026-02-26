import { describe, expect, it } from "@jest/globals";

import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles conditional classes", () => {
    const shouldApply = false;
    expect(cn("px-2", shouldApply && "py-1", "py-2")).toBe("px-2 py-2");
  });

  it("handles undefined and null", () => {
    expect(cn("px-2", undefined, null, "py-1")).toBe("px-2 py-1");
  });
});
