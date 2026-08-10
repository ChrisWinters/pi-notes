import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { afterEach, describe, expect, it } from "vitest";

import registerPiNotesExtension, {
  createNotesMoveDestinationParameterSchema,
  createNotesScopeParameterSchema,
  getNotesAppendToolName,
  getNotesGrepToolName,
  getNotesListToolName,
  getNotesMoveToolName,
  getNotesNewToolName,
  getNotesRenameToolName,
  getNotesSetupToolName,
  getNotesShowToolName
} from "../src/index.js";

interface RegisteredCommand {
  readonly handler: (args: string, ctx: ExtensionContext) => Promise<void>;
}

interface RegisteredTool {
  readonly name: string;
  readonly parameters: unknown;
  readonly execute: (
    toolCallId: string,
    params: Record<string, unknown>,
    signal: AbortSignal | undefined,
    onUpdate: undefined,
    ctx: ExtensionContext
  ) => Promise<{ content: Array<{ type: "text"; text: string }>; details?: unknown }>;
}

interface NotesToolDetails {
  readonly ok: boolean;
  readonly argv: readonly string[];
  readonly truncation?: {
    readonly truncated: boolean;
    readonly outputLines: number;
    readonly totalLines: number;
    readonly outputBytes: number;
    readonly totalBytes: number;
  };
  readonly fullOutputPath?: string;
  readonly artifactRetentionMs?: number;
}

const roots: string[] = [];
const originalHome = process.env["HOME"];

async function createTempCwd(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-tools-test-"));
  roots.push(root);
  process.env["HOME"] = root;
  return join(root, "project");
}

function createExtensionApi(): {
  api: ExtensionAPI;
  commands: Map<string, RegisteredCommand>;
  tools: Map<string, RegisteredTool>;
} {
  const commands = new Map<string, RegisteredCommand>();
  const tools = new Map<string, RegisteredTool>();
  const api = {
    registerCommand: (name: string, command: RegisteredCommand) => {
      commands.set(name, command);
    },
    registerTool: (tool: RegisteredTool) => {
      tools.set(tool.name, tool);
    }
  } as unknown as ExtensionAPI;

  return { api, commands, tools };
}

function createContext(cwd: string): ExtensionContext {
  return {
    cwd,
    hasUI: false
  } as ExtensionContext;
}

function getTool(tools: Map<string, RegisteredTool>, name: string): RegisteredTool {
  const tool = tools.get(name);
  if (tool === undefined) {
    throw new Error(`Missing tool: ${name}`);
  }

  return tool;
}

async function executeTool(
  tools: Map<string, RegisteredTool>,
  name: string,
  params: Record<string, unknown>,
  cwd: string,
  signal?: AbortSignal
): Promise<{ text: string; details: NotesToolDetails }> {
  const result = await getTool(tools, name).execute("test", params, signal, undefined, createContext(cwd));
  const text = result.content.map((part) => part.text).join("\n");
  return { text, details: result.details as NotesToolDetails };
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

describe("pi-notes tools", () => {
  it("exposes tool names", () => {
    expect(getNotesSetupToolName()).toBe("notes_setup");
    expect(getNotesListToolName()).toBe("notes_list");
    expect(getNotesShowToolName()).toBe("notes_show");
    expect(getNotesNewToolName()).toBe("notes_new");
    expect(getNotesAppendToolName()).toBe("notes_append");
    expect(getNotesGrepToolName()).toBe("notes_grep");
    expect(getNotesRenameToolName()).toBe("notes_rename");
    expect(getNotesMoveToolName()).toBe("notes_move");
  });

  it("uses provider-compatible enum schemas", () => {
    expect(createNotesScopeParameterSchema()).toMatchObject({
      type: "string",
      enum: ["default", "project", "global"]
    });
    expect(createNotesScopeParameterSchema()).not.toHaveProperty("anyOf");

    expect(createNotesMoveDestinationParameterSchema()).toMatchObject({
      type: "string",
      enum: ["project", "global"]
    });
    expect(createNotesMoveDestinationParameterSchema()).not.toHaveProperty("anyOf");
  });

  it("registers safe tools and omits destructive tools", () => {
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    expect([...tools.keys()].sort()).toEqual([
      "notes_append",
      "notes_grep",
      "notes_list",
      "notes_move",
      "notes_new",
      "notes_rename",
      "notes_setup",
      "notes_show"
    ]);
    expect(tools.has("notes_rm")).toBe(false);
    expect(tools.has("notes_uninstall")).toBe(false);
    expect(tools.has("notes_edit")).toBe(false);
    expect(tools.has("notes_rewrite")).toBe(false);
    expect(getTool(tools, "notes_move").parameters).not.toHaveProperty("properties.overwrite");
    expect(getTool(tools, "notes_rename").parameters).not.toHaveProperty("properties.overwrite");
  });

  it("creates and shows a project note", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    const created = await executeTool(tools, "notes_new", { name: "agent-log", scope: "project" }, cwd);
    const shown = await executeTool(tools, "notes_show", { name: "agent-log", scope: "project" }, cwd);

    expect(created.details.ok).toBe(true);
    expect(created.text).toContain("Created [project] agent-log.md");
    expect(shown.details.ok).toBe(true);
    expect(shown.text).toContain("# agent-log");
  });

  it("appends, searches, and lists notes", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    await executeTool(tools, "notes_new", { name: "daily", scope: "project" }, cwd);
    const appended = await executeTool(
      tools,
      "notes_append",
      { name: "daily", text: "shipped-tools", scope: "project" },
      cwd
    );
    const grep = await executeTool(tools, "notes_grep", { query: "shipped-tools", scope: "project" }, cwd);
    const list = await executeTool(tools, "notes_list", { scope: "project" }, cwd);

    expect(appended.details.ok).toBe(true);
    expect(grep.text).toContain("[project] daily.md");
    expect(list.text).toContain("[project] daily.md");
  });

  it("renames and moves notes", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    await executeTool(tools, "notes_new", { name: "source", scope: "project" }, cwd);
    const renamed = await executeTool(
      tools,
      "notes_rename",
      { fromName: "source", toName: "renamed", scope: "project" },
      cwd
    );
    const moved = await executeTool(
      tools,
      "notes_move",
      { name: "renamed", scope: "project", destination: "global" },
      cwd
    );
    const shown = await executeTool(tools, "notes_show", { name: "renamed", scope: "global" }, cwd);

    expect(renamed.details.ok).toBe(true);
    expect(moved.details.ok).toBe(true);
    expect(moved.details.argv).toEqual(["move", "renamed", "--to-global", "--project"]);
    expect(shown.text).toContain("# source");
  });

  it("throws for missing notes even when interactive presentation is a warning", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    await expect(executeTool(tools, "notes_show", { name: "missing", scope: "project" }, cwd)).rejects.toThrow(
      "Note not found: missing"
    );
  });

  it("returns exact interactive overwrite handoffs for conflicts", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);
    await executeTool(tools, "notes_new", { name: "source", scope: "project" }, cwd);
    await executeTool(tools, "notes_new", { name: "target", scope: "project" }, cwd);

    await expect(
      executeTool(tools, "notes_rename", { fromName: "source", toName: "target", scope: "project" }, cwd)
    ).rejects.toThrow("/notes rename source target --project --overwrite");
  });

  it("runs setup and throws handler errors", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    const setup = await executeTool(tools, "notes_setup", {}, cwd);
    const firstCreate = await executeTool(tools, "notes_new", { name: "dupe", scope: "project" }, cwd);

    expect(setup.details.ok).toBe(true);
    expect(setup.text).toContain("Notes setup complete");
    expect(firstCreate.details.ok).toBe(true);
    await expect(executeTool(tools, "notes_new", { name: "dupe", scope: "project" }, cwd)).rejects.toThrow(
      "Note already exists: dupe.md"
    );
  });

  it("rejects a pre-aborted mutation without creating a note", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);
    const controller = new AbortController();
    controller.abort();

    await expect(
      executeTool(tools, "notes_new", { name: "cancelled", scope: "project" }, cwd, controller.signal)
    ).rejects.toThrow("Notes operation cancelled");
    const list = await executeTool(tools, "notes_list", { scope: "project" }, cwd);
    expect(list.text).not.toContain("cancelled.md");
  });

  it("rejects headless direct commands with an observable CLI handoff", async () => {
    const cwd = await createTempCwd();
    const { api, commands } = createExtensionApi();
    registerPiNotesExtension(api);
    const command = commands.get("notes");
    expect(command).toBeDefined();

    const notifications: string[] = [];
    const context = {
      cwd,
      mode: "print",
      hasUI: false,
      ui: {
        notify: (message: string) => notifications.push(message)
      }
    } as unknown as ExtensionContext;

    await expect(command?.handler("show daily --project", context)).rejects.toThrow(
      "pi-notes show daily --project"
    );
    expect(notifications).toEqual([]);
  });

  it("emits one notification for direct commands in RPC mode", async () => {
    const cwd = await createTempCwd();
    const { api, commands } = createExtensionApi();
    registerPiNotesExtension(api);
    const notifications: string[] = [];
    const context = {
      cwd,
      mode: "rpc",
      hasUI: true,
      ui: {
        notify: (message: string) => notifications.push(message),
        confirm: () => Promise.resolve(false),
        editor: () => Promise.resolve(undefined)
      }
    } as unknown as ExtensionContext;

    await commands.get("notes")?.handler("ls --project", context);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toContain("No notes found");
  });

  it("truncates large tool output and retains the complete private artifact", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    await executeTool(tools, "notes_new", { name: "large", scope: "project" }, cwd);
    await executeTool(
      tools,
      "notes_append",
      { name: "large", text: Array.from({ length: 2_100 }, (_, index) => `line-${index}`).join("\n"), scope: "project" },
      cwd
    );

    const shown = await executeTool(tools, "notes_show", { name: "large", scope: "project" }, cwd);

    expect(shown.details.ok).toBe(true);
    expect(shown.text).toContain("[Output truncated:");
    expect(shown.text).toContain("Full output saved to:");
    expect(shown.text).not.toContain("line-2099");
    expect(shown.details.truncation).toMatchObject({ truncated: true, outputLines: 2_000 });
    expect(shown.details.artifactRetentionMs).toBe(86_400_000);

    const fullOutputPath = shown.details.fullOutputPath;
    expect(fullOutputPath).toBeDefined();
    if (fullOutputPath === undefined) {
      throw new Error("Missing full output artifact path");
    }

    expect(relative(cwd, fullOutputPath).startsWith("..")).toBe(true);
    expect(dirname(fullOutputPath).startsWith(tmpdir())).toBe(true);
    expect(await readFile(fullOutputPath, "utf8")).toContain("line-2099");
    if (process.platform !== "win32") {
      expect((await stat(fullOutputPath)).mode & 0o777).toBe(0o600);
    }
    await rm(dirname(fullOutputPath), { recursive: true, force: true });
  });
});
