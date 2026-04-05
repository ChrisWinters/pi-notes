import { describe, expect, it } from "vitest";

import { normalizeNoteName } from "../src/core/naming.js";

describe("normalizeNoteName", () => {
  it("normalizes spaces and case", () => {
    expect(normalizeNoteName("Project Ideas")).toBe("project-ideas.md");
  });

  it("rejects traversal-like names", () => {
    expect(() => normalizeNoteName("../secrets")).toThrowError();
  });
});
