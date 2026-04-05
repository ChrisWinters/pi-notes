import { describe, expect, it } from "vitest";

import { parseNotesCommandInput } from "../src/commands/parser.js";

describe("parseNotesCommandInput", () => {
  it("parses trailing scope flags without stripping middle content", () => {
    const parsed = parseNotesCommandInput("append daily keep --global token");

    expect(parsed.subcommand).toBe("append");
    expect(parsed.scopeSelection.forceProject).toBe(false);
    expect(parsed.scopeSelection.forceGlobal).toBe(false);
    expect(parsed.args).toEqual(["daily", "keep", "--global", "token"]);
  });

  it("parses leading and trailing scope flags", () => {
    const parsed = parseNotesCommandInput("--project append daily note --global");

    expect(parsed.subcommand).toBe("append");
    expect(parsed.scopeSelection.forceProject).toBe(true);
    expect(parsed.scopeSelection.forceGlobal).toBe(true);
    expect(parsed.args).toEqual(["daily", "note"]);
  });

  it("supports -- end-of-options separator", () => {
    const parsed = parseNotesCommandInput("grep -- --global");

    expect(parsed.subcommand).toBe("grep");
    expect(parsed.scopeSelection.forceGlobal).toBe(false);
    expect(parsed.args).toEqual(["--global"]);
  });
});
