import { describe, expect, it } from "vitest";

import { resolveScopePreference } from "../src/core/storage.js";

describe("resolveScopePreference", () => {
  it("returns default with no force flags", () => {
    expect(resolveScopePreference({ forceProject: false, forceGlobal: false })).toBe("default");
  });

  it("throws on conflicting scope flags", () => {
    expect(() => resolveScopePreference({ forceProject: true, forceGlobal: true })).toThrowError();
  });
});
