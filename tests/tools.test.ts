import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
}

const roots: string[] = [];
const originalHome = process.env["HOME"];

async function createTempCwd(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-tools-test-"));
  roots.push(root);
  process.env["HOME"] = root;
  return join(root, "project");
}

function createExtensionApi(): { api: ExtensionAPI; tools: Map<string, RegisteredTool> } {
  const tools = new Map<string, RegisteredTool>();
  const api = {
    registerCommand: () => undefined,
    registerTool: (tool: RegisteredTool) => {
      tools.set(tool.name, tool);
    }
  } as unknown as ExtensionAPI;

  return { api, tools };
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
  cwd: string
): Promise<{ text: string; details: NotesToolDetails }> {
  const result = await getTool(tools, name).execute("test", params, undefined, undefined, createContext(cwd));
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

  it("runs setup and reports handler errors", async () => {
    const cwd = await createTempCwd();
    const { api, tools } = createExtensionApi();
    registerPiNotesExtension(api);

    const setup = await executeTool(tools, "notes_setup", {}, cwd);
    const firstCreate = await executeTool(tools, "notes_new", { name: "dupe", scope: "project" }, cwd);
    const secondCreate = await executeTool(tools, "notes_new", { name: "dupe", scope: "project" }, cwd);

    expect(setup.details.ok).toBe(true);
    expect(setup.text).toContain("Notes setup complete");
    expect(firstCreate.details.ok).toBe(true);
    expect(secondCreate.details.ok).toBe(false);
    expect(secondCreate.text).toContain("Note already exists: dupe.md");
  });
});
