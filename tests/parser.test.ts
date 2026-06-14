import { describe, expect, it } from "vitest";

import { parseNotesCommandArgv, parseNotesCommandInput } from "../src/commands/parser.js";

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

  it("parses move target flags from argument edges", () => {
    const parsed = parseNotesCommandInput("move test-note --to-global --project");

    expect(parsed.subcommand).toBe("move");
    expect(parsed.scopeSelection.forceProject).toBe(true);
    expect(parsed.scopeSelection.forceGlobal).toBe(false);
    expect(parsed.moveSelection.toGlobal).toBe(true);
    expect(parsed.moveSelection.toProject).toBe(false);
    expect(parsed.moveSelection.overwrite).toBe(false);
    expect(parsed.args).toEqual(["test-note"]);
  });

  it("preserves middle move-like flags as literal args", () => {
    const parsed = parseNotesCommandInput("move test-note keep --to-global token");

    expect(parsed.subcommand).toBe("move");
    expect(parsed.moveSelection.toGlobal).toBe(false);
    expect(parsed.args).toEqual(["test-note", "keep", "--to-global", "token"]);
  });

  it("treats move flags as literal tokens after -- separator", () => {
    const parsed = parseNotesCommandInput("move test-note -- --to-project --overwrite");

    expect(parsed.subcommand).toBe("move");
    expect(parsed.moveSelection.toProject).toBe(false);
    expect(parsed.moveSelection.overwrite).toBe(false);
    expect(parsed.args).toEqual(["test-note", "--to-project", "--overwrite"]);
  });

  it("captures conflicting move targets for downstream validation", () => {
    const parsed = parseNotesCommandInput("move test-note --to-project --to-global");

    expect(parsed.subcommand).toBe("move");
    expect(parsed.moveSelection.toProject).toBe(true);
    expect(parsed.moveSelection.toGlobal).toBe(true);
    expect(parsed.args).toEqual(["test-note"]);
  });

  it("does not parse move flags for non-move subcommands", () => {
    const parsed = parseNotesCommandInput("append daily --to-global");

    expect(parsed.subcommand).toBe("append");
    expect(parsed.moveSelection.toGlobal).toBe(false);
    expect(parsed.args).toEqual(["daily", "--to-global"]);
  });

  it("parses argv tokens with the same semantics", () => {
    const parsed = parseNotesCommandArgv(["move", "handoff", "--to-global", "--project"]);

    expect(parsed.subcommand).toBe("move");
    expect(parsed.scopeSelection.forceProject).toBe(true);
    expect(parsed.moveSelection.toGlobal).toBe(true);
    expect(parsed.args).toEqual(["handoff"]);
  });

  it("parses rename overwrite edge flag", () => {
    const parsed = parseNotesCommandInput("rename old-name new-name --overwrite");

    expect(parsed.subcommand).toBe("rename");
    expect(parsed.moveSelection.overwrite).toBe(true);
    expect(parsed.args).toEqual(["old-name", "new-name"]);
  });
});
