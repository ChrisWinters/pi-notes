import { describe, expect, it } from "vitest";

import { createEmptyNoteMarkdown } from "../src/core/format.js";

describe("createEmptyNoteMarkdown", () => {
  it("renders a markdown template with frontmatter", () => {
    const markdown = createEmptyNoteMarkdown("API Ideas", "2026-04-05T12:00:00.000Z");

    expect(markdown).toContain("title: API Ideas");
    expect(markdown).toContain("updated: 2026-04-05T12:00:00.000Z");
    expect(markdown).toContain("# API Ideas");
  });
});
