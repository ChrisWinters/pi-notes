import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

import { handleNotesCommand } from "../src/commands/notes.js";

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

async function createTempCwd(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-command-test-"));
  roots.push(root);
  return join(root, "project");
}

function createContext(
  cwd: string,
  hasUI: boolean,
  confirmResult: boolean,
  editorResult?: string
): TestContext {
  return {
    cwd,
    hasUI,
    ui: {
      notify: vi.fn(),
      confirm: vi.fn(() => Promise.resolve(confirmResult)),
      editor: vi.fn((_title: string, prefilled: string) => Promise.resolve(editorResult ?? prefilled))
    }
  };
}

afterEach(async () => {
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
    await handleNotesCommand("rm remove-me", nonInteractiveCtx as unknown as ExtensionCommandContext);

    const messages = nonInteractiveCtx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("requires an interactive UI"))).toBe(true);
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

    const ctx = createContext(cwd, true, true, rewritten);

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
    const ctx = createContext(cwd, true, false, "# changed");

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

    await handleNotesCommand("rewrite missing-note apply this", ctx as unknown as ExtensionCommandContext);

    const messages = ctx.ui.notify.mock.calls.map((call) => call[0] as string);
    expect(messages.some((message) => message.includes("Note not found: missing-note"))).toBe(true);
  });
});
