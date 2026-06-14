import { describe, expect, it } from "vitest";

import {
  createEmptyNoteMarkdown,
  parseNoteMarkdown,
  renderNoteMarkdown,
  withUpdatedTimestamp
} from "../src/core/format.js";

describe("createEmptyNoteMarkdown", () => {
  it("renders a markdown template with frontmatter", () => {
    const markdown = createEmptyNoteMarkdown("API Ideas", "2026-04-05T12:00:00.000Z");

    expect(markdown).toBe(
      [
        "---",
        "title: API Ideas",
        "updated: 2026-04-05T12:00:00.000Z",
        "---",
        "",
        "## API Ideas",
        ""
      ].join("\n")
    );
  });
});

describe("parseNoteMarkdown + renderNoteMarkdown", () => {
  it("parses and renders with tags", () => {
    const raw = [
      "---",
      "title: API Ideas",
      "updated: 2026-04-05T12:00:00.000Z",
      "tags: [pi, notes]",
      "---",
      "# API Ideas",
      "",
      "Line two"
    ].join("\n");

    const parsed = parseNoteMarkdown(raw);
    expect(parsed.frontmatter.title).toBe("API Ideas");
    expect(parsed.frontmatter.tags).toEqual(["pi", "notes"]);

    const rendered = renderNoteMarkdown(parsed.frontmatter, parsed.body);
    expect(rendered).toContain("tags: [pi, notes]");
    expect(rendered).toContain("# API Ideas");
  });

  it("updates timestamp while preserving content", () => {
    const original = createEmptyNoteMarkdown("Roadmap", "2026-04-05T12:00:00.000Z");
    const updated = withUpdatedTimestamp(original, "2026-04-05T13:00:00.000Z");

    const parsed = parseNoteMarkdown(updated);
    expect(parsed.frontmatter.updated).toBe("2026-04-05T13:00:00.000Z");
    expect(parsed.frontmatter.title).toBe("Roadmap");
    expect(parsed.body).toContain("## Roadmap");
  });
});
