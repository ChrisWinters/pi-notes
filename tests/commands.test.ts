import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

import { handleNotesCommand } from "../src/commands/notes.js";

interface TestUi {
  readonly notify: ReturnType<typeof vi.fn>;
  readonly confirm: ReturnType<typeof vi.fn>;
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

function createContext(cwd: string, hasUI: boolean, confirmResult: boolean): TestContext {
  return {
    cwd,
    hasUI,
    ui: {
      notify: vi.fn(),
      confirm: vi.fn(() => Promise.resolve(confirmResult))
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
});
