import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

import { handleNotesCommand } from "../src/commands/notes.js";
import { NOTES_USAGE } from "../src/commands/shared.js";

interface TestUi {
  readonly notify: ReturnType<typeof vi.fn>;
  readonly confirm: ReturnType<typeof vi.fn>;
  readonly editor: ReturnType<typeof vi.fn>;
}

interface TestContext {
  readonly cwd: string;
  readonly hasUI: boolean;
  readonly ui: TestUi;
}

const roots: string[] = [];
const originalHome = process.env["HOME"];

async function createTempCwd(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-command-test-"));
  roots.push(root);
  process.env["HOME"] = root;
  return join(root, "project");
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function createContext(
  cwd: string,
  hasUI: boolean,
  confirmResult: boolean,
  options?: {
    readonly editorResult?: string;
    readonly editorImpl?: (title: string, prefilled: string) => Promise<string | undefined>;
  }
): TestContext {
  const editor =
    options?.editorImpl ??
    vi.fn((_title: string, prefilled: string) => Promise.resolve(options?.editorResult ?? prefilled));

  return {
    cwd,
    hasUI,
    ui: {
      notify: vi.fn(),
      confirm: vi.fn(() => Promise.resolve(confirmResult)),
      editor: vi.fn(editor)
    }
  };
}

afterEach(async () => {
  process.env["HOME"] = originalHome;

  while (roots.length > 0) {
    const root = roots.pop();
    if (root !== undefined) {
      await rm(root, { recursive: true, force: true });
    }
  }
});

describe("handleNotesCommand", () => {
  it("creates and shows a note", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new sprint-log", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("show sprint-log", ctx as unknown as ExtensionCommandContext);

    const notifyCalls = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(notifyCalls.some((message) => message.includes("Created [project] sprint-log.md"))).toBe(true);
    expect(notifyCalls.some((message) => message.includes("# sprint-log"))).toBe(true);
  });

  it("appends content and lists notes", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new daily", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("append daily shipped-t004", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("ls", ctx as unknown as ExtensionCommandContext);

    const notifyCalls = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(notifyCalls.some((message) => message.includes("Updated [project] daily.md"))).toBe(true);
    expect(notifyCalls.some((message) => message.includes("[project] daily.md"))).toBe(true);
  });

  it("supports hidden add and list aliases", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("add alias-note --project", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("list --project", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("show alias-note --project", ctx as unknown as ExtensionCommandContext);

    const notifyCalls = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(notifyCalls.some((message) => message.includes("Created [project] alias-note.md"))).toBe(true);
    expect(notifyCalls.some((message) => message.includes("[project] alias-note.md"))).toBe(true);
    expect(notifyCalls.some((message) => message.includes("## alias-note"))).toBe(true);
  });

  it("keeps hidden aliases out of usage and README command lists", async () => {
    const readme = await readFile(join(process.cwd(), "README.md"), "utf8");

    expect(NOTES_USAGE).not.toContain("/notes add");
    expect(NOTES_USAGE).not.toContain("/notes list");
    expect(readme).not.toContain("/notes add");
    expect(readme).not.toContain("/notes list");
  });

  it("preserves literal scope-like tokens inside append content", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new parser-bug", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand(
      "append parser-bug keep --global token",
      ctx as unknown as ExtensionCommandContext
    );
    await handleNotesCommand("show parser-bug", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Updated [project] parser-bug.md"))).toBe(true);
    expect(messages.some((message) => message.includes("keep --global token"))).toBe(true);
  });

  it("requires interactive ui for rm", async () => {
    const cwd = await createTempCwd();
    const interactiveCtx = createContext(cwd, true, true);
    await handleNotesCommand("new remove-me", interactiveCtx as unknown as ExtensionCommandContext);

    const nonInteractiveCtx = createContext(cwd, false, true);
    const outcome = await handleNotesCommand("rm remove-me", nonInteractiveCtx as unknown as ExtensionCommandContext);

    expect(outcome.status).toBe("failure");
    expect(nonInteractiveCtx.ui.notify).toHaveBeenCalledWith(
      "This subcommand requires an interactive UI session.",
      "error"
    );
    expect(nonInteractiveCtx.ui.confirm).not.toHaveBeenCalled();
    expect(nonInteractiveCtx.ui.editor).not.toHaveBeenCalled();
  });

  it("returns a warning without confirmation when the rm note is missing", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    const outcome = await handleNotesCommand("rm missing-note", ctx as unknown as ExtensionCommandContext);

    expect(outcome.status).toBe("failure");
    expect(ctx.ui.notify).toHaveBeenCalledWith("Note not found: missing-note", "warning");
    expect(ctx.ui.confirm).not.toHaveBeenCalled();
    expect(ctx.ui.editor).not.toHaveBeenCalled();
  });

  it("deletes note after confirmation", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new remove-me", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("rm remove-me", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("show remove-me", ctx as unknown as ExtensionCommandContext);

    expect(ctx.ui.confirm).toHaveBeenCalledTimes(1);
    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Deleted [project] remove-me.md"))).toBe(true);
    expect(messages.some((message) => message.includes("Note not found: remove-me"))).toBe(true);
  });

  it("returns grep hits for matching query", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new launch-notes", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("append launch-notes shipping-checklist", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("grep checklist", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Search results for: checklist"))).toBe(true);
    expect(messages.some((message) => message.includes("[project] launch-notes.md"))).toBe(true);
  });

  it("returns no-hit message for grep misses", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new qa-notes", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("grep no-such-term", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("No notes matched query: no-such-term"))).toBe(true);
  });

  it("respects scope flags for grep results", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new context --project", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("append context project-term", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("new context --global", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("append context global-term --global", ctx as unknown as ExtensionCommandContext);

    await handleNotesCommand("grep global-term --project", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("grep global-term --global", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("No notes matched query: global-term"))).toBe(true);
    expect(messages.some((message) => message.includes("[global] context.md"))).toBe(true);
  });

  it("returns error for invalid grep query", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("grep", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Missing query for /notes grep."))).toBe(true);
  });

  it("supports literal grep query tokens via -- separator", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new parser-query", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand(
      "append parser-query literal --global token",
      ctx as unknown as ExtensionCommandContext
    );
    await handleNotesCommand("grep -- --global", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Search results for: --global"))).toBe(true);
    expect(messages.some((message) => message.includes("[project] parser-query.md"))).toBe(true);
  });

  it("preserves literal flag-like tokens in rewrite instruction", async () => {
    const cwd = await createTempCwd();
    const rewritten = [
      "---",
      "title: rewrite-flags",
      "updated: 2026-04-05T12:00:00.000Z",
      "---",
      "# rewrite-flags",
      "Updated body"
    ].join("\n");

    const ctx = createContext(cwd, true, true, { editorResult: rewritten });

    await handleNotesCommand("new rewrite-flags", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand(
      "rewrite rewrite-flags keep --global token",
      ctx as unknown as ExtensionCommandContext
    );

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("instruction: keep --global token"))).toBe(true);
  });

  it("rewrites note after preview and confirmation", async () => {
    const cwd = await createTempCwd();
    const rewritten = [
      "---",
      "title: rewrite-me",
      "updated: 2026-04-05T12:00:00.000Z",
      "---",
      "# rewrite-me",
      "Updated content"
    ].join("\n");

    const ctx = createContext(cwd, true, true, { editorResult: rewritten });

    await handleNotesCommand("new rewrite-me", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand(
      "rewrite rewrite-me simplify wording",
      ctx as unknown as ExtensionCommandContext
    );
    await handleNotesCommand("show rewrite-me", ctx as unknown as ExtensionCommandContext);

    expect(ctx.ui.editor).toHaveBeenCalledTimes(1);
    expect(ctx.ui.confirm).toHaveBeenCalled();

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Rewrite preview"))).toBe(true);
    expect(messages.some((message) => message.includes("Rewrote [project] rewrite-me.md"))).toBe(true);
    expect(messages.some((message) => message.includes("Updated content"))).toBe(true);
  });

  it("cancels rewrite when confirmation is denied", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, false, { editorResult: "# changed" });

    await handleNotesCommand("new no-rewrite", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand(
      "rewrite no-rewrite do not apply",
      ctx as unknown as ExtensionCommandContext
    );

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Rewrite cancelled."))).toBe(true);
  });

  it("returns warning when rewrite note is missing", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    const outcome = await handleNotesCommand(
      "rewrite missing-note apply this",
      ctx as unknown as ExtensionCommandContext
    );

    expect(outcome.status).toBe("failure");
    expect(ctx.ui.notify).toHaveBeenCalledWith("Note not found: missing-note", "warning");
    expect(ctx.ui.editor).not.toHaveBeenCalled();
    expect(ctx.ui.confirm).not.toHaveBeenCalled();
  });

  it("shows usage for explicit help aliases", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("help", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("commands", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("/notes setup"))).toBe(true);
    expect(messages.some((message) => message.includes("/notes uninstall"))).toBe(true);
  });

  it("runs setup idempotently and provides follow-up guidance", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("setup", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("setup", ctx as unknown as ExtensionCommandContext);

    const projectPath = join(cwd, ".pi", "notes");
    const globalPath = join(process.env["HOME"] ?? "", ".pi", "notes");
    const starterPath = join(globalPath, "note.md");

    expect(await pathExists(projectPath)).toBe(true);
    expect(await pathExists(globalPath)).toBe(true);
    expect(await pathExists(starterPath)).toBe(true);

    const starter = await readFile(starterPath, "utf8");
    expect(starter).toContain("---\n\n## Welcome to notes\n\nUse /notes new <name> to create notes.");

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Run /notes show note --global"))).toBe(true);
    expect(messages.some((message) => message.includes("starter note already exists"))).toBe(true);
  });

  it("edits markdown while preserving multi-line content", async () => {
    const cwd = await createTempCwd();
    const edited = [
      "---",
      "title: formatting",
      "updated: 2026-04-05T12:00:00.000Z",
      "---",
      "# formatting",
      "",
      "Paragraph one.",
      "",
      "Paragraph two with spacing."
    ].join("\n");
    const ctx = createContext(cwd, true, true, { editorResult: edited });

    await handleNotesCommand("new formatting", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("edit formatting", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("show formatting", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Edited [project] formatting.md"))).toBe(true);
    expect(messages.some((message) => message.includes("Paragraph one.\n\nParagraph two with spacing."))).toBe(true);
  });

  it("cancels edit when editor returns undefined", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true, {
      editorImpl: () => Promise.resolve(undefined)
    });

    await handleNotesCommand("new keep-original", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("append keep-original original-body", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("edit keep-original", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("show keep-original", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Edit cancelled."))).toBe(true);
    expect(messages.some((message) => message.includes("original-body"))).toBe(true);
  });

  it("moves a note from project scope to global scope", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new transfer", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("move transfer --to-global --project", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("show transfer --global", ctx as unknown as ExtensionCommandContext);

    const projectPath = join(cwd, ".pi", "notes", "transfer.md");
    expect(await pathExists(projectPath)).toBe(false);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Moved [project] transfer.md -> [global]"))).toBe(true);
    expect(messages.some((message) => message.includes("[global] transfer.md"))).toBe(true);
  });

  it("requires explicit destination for move", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new move-me", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("move move-me", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Missing move destination"))).toBe(true);
  });

  it("renames a note in project scope", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new release-plan", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("rename release-plan launch-plan", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("show launch-plan", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Renamed [project] release-plan.md -> launch-plan.md"))).toBe(true);
    expect(messages.some((message) => message.includes("[project] launch-plan.md"))).toBe(true);
  });

  it("requires confirmation for rename overwrite", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, false);

    await handleNotesCommand("new alpha", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("new beta", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("rename alpha beta --overwrite", ctx as unknown as ExtensionCommandContext);

    expect(ctx.ui.confirm).toHaveBeenCalledTimes(1);
    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Rename cancelled."))).toBe(true);
  });

  it("refuses uninstall when UI is unavailable", async () => {
    const cwd = await createTempCwd();
    const interactiveCtx = createContext(cwd, true, true);
    await handleNotesCommand("new remove-dir", interactiveCtx as unknown as ExtensionCommandContext);

    const nonInteractiveCtx = createContext(cwd, false, true);
    await handleNotesCommand("uninstall", nonInteractiveCtx as unknown as ExtensionCommandContext);

    const messages = nonInteractiveCtx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("requires an interactive UI"))).toBe(true);
  });

  it("uninstall defaults to project notes only", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new project-remove", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("new global-keep --global", ctx as unknown as ExtensionCommandContext);

    await handleNotesCommand("uninstall", ctx as unknown as ExtensionCommandContext);

    const projectPath = join(cwd, ".pi", "notes");
    const globalNotePath = join(process.env["HOME"] ?? "", ".pi", "notes", "global-keep.md");
    expect(await pathExists(projectPath)).toBe(false);
    expect(await pathExists(globalNotePath)).toBe(true);
  });

  it("uninstalls global notes when --global is provided", async () => {
    const cwd = await createTempCwd();
    const ctx = createContext(cwd, true, true);

    await handleNotesCommand("new global-remove --global", ctx as unknown as ExtensionCommandContext);
    await handleNotesCommand("uninstall --global", ctx as unknown as ExtensionCommandContext);

    const globalPath = join(process.env["HOME"] ?? "", ".pi", "notes");
    expect(await pathExists(globalPath)).toBe(false);
  });
});
