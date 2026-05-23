import type { AgentToolResult, ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type, type Static, type TSchema, type TUnsafe } from "typebox";

import type { NotesNotifyLevel } from "./commands/context.js";
import { handleNotesCommand, handleNotesCommandArgv } from "./commands/notes.js";

const NOTES_SETUP_TOOL_NAME = "notes_setup";
const NOTES_LIST_TOOL_NAME = "notes_list";
const NOTES_SHOW_TOOL_NAME = "notes_show";
const NOTES_NEW_TOOL_NAME = "notes_new";
const NOTES_APPEND_TOOL_NAME = "notes_append";
const NOTES_GREP_TOOL_NAME = "notes_grep";
const NOTES_RENAME_TOOL_NAME = "notes_rename";
const NOTES_MOVE_TOOL_NAME = "notes_move";

const NOTES_SCOPE_VALUES = ["default", "project", "global"] as const;
const NOTES_MOVE_DESTINATION_VALUES = ["project", "global"] as const;

type NotesToolScope = (typeof NOTES_SCOPE_VALUES)[number];
type NotesMoveDestination = (typeof NOTES_MOVE_DESTINATION_VALUES)[number];

interface NotesToolMessage {
  readonly level: NotesNotifyLevel;
  readonly message: string;
}

interface NotesToolDetails {
  readonly tool: string;
  readonly argv: readonly string[];
  readonly ok: boolean;
  readonly messages: readonly NotesToolMessage[];
}

type NotesToolResult = AgentToolResult<NotesToolDetails>;

export function getNotesSetupToolName(): string {
  return NOTES_SETUP_TOOL_NAME;
}

export function getNotesListToolName(): string {
  return NOTES_LIST_TOOL_NAME;
}

export function getNotesShowToolName(): string {
  return NOTES_SHOW_TOOL_NAME;
}

export function getNotesNewToolName(): string {
  return NOTES_NEW_TOOL_NAME;
}

export function getNotesAppendToolName(): string {
  return NOTES_APPEND_TOOL_NAME;
}

export function getNotesGrepToolName(): string {
  return NOTES_GREP_TOOL_NAME;
}

export function getNotesRenameToolName(): string {
  return NOTES_RENAME_TOOL_NAME;
}

export function getNotesMoveToolName(): string {
  return NOTES_MOVE_TOOL_NAME;
}

export function createNotesScopeParameterSchema(): TUnsafe<NotesToolScope> {
  return Type.Unsafe<NotesToolScope>({
    type: "string",
    enum: NOTES_SCOPE_VALUES,
    description: "Notes scope. Use default to read project first then global where the command supports fallback."
  });
}

export function createNotesMoveDestinationParameterSchema(): TUnsafe<NotesMoveDestination> {
  return Type.Unsafe<NotesMoveDestination>({
    type: "string",
    enum: NOTES_MOVE_DESTINATION_VALUES,
    description: "Destination scope for moving the note."
  });
}

function applyScope(argv: string[], scope: NotesToolScope | undefined): string[] {
  if (scope === "project") {
    return [...argv, "--project"];
  }

  if (scope === "global") {
    return [...argv, "--global"];
  }

  return argv;
}

async function executeNotesTool(tool: string, argv: readonly string[], ctx: ExtensionContext): Promise<NotesToolResult> {
  const messages: NotesToolMessage[] = [];

  await handleNotesCommandArgv(argv, {
    cwd: ctx.cwd,
    hasUI: false,
    ui: {
      notify: (message, level) => {
        messages.push({ message, level });
      },
      confirm: () => Promise.resolve(false),
      editor: () => Promise.resolve(undefined)
    }
  });

  const ok = messages.every((message) => message.level !== "error");
  const text = messages.length > 0
    ? messages.map((message) => message.message).join("\n")
    : "No output from notes command.";

  return {
    content: [{ type: "text", text }],
    details: {
      tool,
      argv,
      ok,
      messages
    }
  };
}

const EmptyParameters = Type.Object({});
const ScopeParameters = Type.Object({
  scope: Type.Optional(createNotesScopeParameterSchema())
});
const NamedNoteParameters = Type.Object({
  name: Type.String({ description: "Note name." }),
  scope: Type.Optional(createNotesScopeParameterSchema())
});
const AppendParameters = Type.Object({
  name: Type.String({ description: "Note name." }),
  text: Type.String({ description: "Text to append to the note." }),
  scope: Type.Optional(createNotesScopeParameterSchema())
});
const GrepParameters = Type.Object({
  query: Type.String({ description: "Search query." }),
  scope: Type.Optional(createNotesScopeParameterSchema())
});
const RenameParameters = Type.Object({
  fromName: Type.String({ description: "Current note name." }),
  toName: Type.String({ description: "New note name." }),
  scope: Type.Optional(createNotesScopeParameterSchema()),
  overwrite: Type.Optional(Type.Boolean({ description: "Overwrite an existing destination note." }))
});
const MoveParameters = Type.Object({
  name: Type.String({ description: "Note name." }),
  destination: createNotesMoveDestinationParameterSchema(),
  scope: Type.Optional(createNotesScopeParameterSchema()),
  overwrite: Type.Optional(Type.Boolean({ description: "Overwrite an existing destination note." }))
});

function registerNotesTool<TParams extends TSchema>(
  pi: ExtensionAPI,
  tool: {
    readonly name: string;
    readonly label: string;
    readonly description: string;
    readonly promptSnippet: string;
    readonly promptGuidelines: readonly string[];
    readonly parameters: TParams;
    readonly toArgv: (params: Static<TParams>) => readonly string[];
  }
): void {
  pi.registerTool({
    name: tool.name,
    label: tool.label,
    description: tool.description,
    promptSnippet: tool.promptSnippet,
    promptGuidelines: [...tool.promptGuidelines],
    parameters: tool.parameters,
    execute: async (_toolCallId, params, _signal, _onUpdate, ctx) => {
      return executeNotesTool(tool.name, tool.toArgv(params), ctx);
    }
  });
}

function registerPiNotesTools(pi: ExtensionAPI): void {
  registerNotesTool(pi, {
    name: NOTES_SETUP_TOOL_NAME,
    label: "Setup Notes",
    description: "Initialize pi-notes project/global directories and starter note.",
    promptSnippet: "Initialize pi-notes storage with setup.",
    promptGuidelines: ["Use notes_setup when the user asks to set up or initialize pi-notes storage."],
    parameters: EmptyParameters,
    toArgv: () => ["setup"]
  });

  registerNotesTool(pi, {
    name: NOTES_LIST_TOOL_NAME,
    label: "List Notes",
    description: "List notes in project, global, or default scope.",
    promptSnippet: "List pi-notes notes in project or global scope.",
    promptGuidelines: ["Use notes_list when the user asks to list or browse pi-notes notes."],
    parameters: ScopeParameters,
    toArgv: (params) => applyScope(["ls"], params.scope)
  });

  registerNotesTool(pi, {
    name: NOTES_SHOW_TOOL_NAME,
    label: "Show Note",
    description: "Show a note by name from project, global, or default scope.",
    promptSnippet: "Show a pi-notes note by name.",
    promptGuidelines: ["Use notes_show when the user asks to read, show, or open a note and the note name is known."],
    parameters: NamedNoteParameters,
    toArgv: (params) => applyScope(["show", params.name], params.scope)
  });

  registerNotesTool(pi, {
    name: NOTES_NEW_TOOL_NAME,
    label: "New Note",
    description: "Create a new note by name in project or global scope.",
    promptSnippet: "Create a new pi-notes note by name.",
    promptGuidelines: ["Use notes_new when the user asks to create a pi-notes note and the scope is clear."],
    parameters: NamedNoteParameters,
    toArgv: (params) => applyScope(["new", params.name], params.scope)
  });

  registerNotesTool(pi, {
    name: NOTES_APPEND_TOOL_NAME,
    label: "Append Note",
    description: "Append text to an existing note.",
    promptSnippet: "Append text to an existing pi-notes note.",
    promptGuidelines: ["Use notes_append when the user asks to add text to a note and the note name and scope are clear."],
    parameters: AppendParameters,
    toArgv: (params) => applyScope(["append", params.name, params.text], params.scope)
  });

  registerNotesTool(pi, {
    name: NOTES_GREP_TOOL_NAME,
    label: "Search Notes",
    description: "Search notes for a query in project, global, or default scope.",
    promptSnippet: "Search pi-notes notes by query.",
    promptGuidelines: ["Use notes_grep when the user asks to search or grep notes."],
    parameters: GrepParameters,
    toArgv: (params) => applyScope(["grep", params.query], params.scope)
  });

  registerNotesTool(pi, {
    name: NOTES_RENAME_TOOL_NAME,
    label: "Rename Note",
    description: "Rename a note with optional overwrite behavior.",
    promptSnippet: "Rename a pi-notes note.",
    promptGuidelines: ["Use notes_rename when the user asks to rename a note and source, destination, and scope are clear."],
    parameters: RenameParameters,
    toArgv: (params) => {
      const argv = applyScope(["rename", params.fromName, params.toName], params.scope);
      return params.overwrite === true ? [...argv, "--overwrite"] : argv;
    }
  });

  registerNotesTool(pi, {
    name: NOTES_MOVE_TOOL_NAME,
    label: "Move Note",
    description: "Move a note between project and global scope.",
    promptSnippet: "Move a pi-notes note between project and global scope.",
    promptGuidelines: ["Use notes_move when the user asks to move a note between project and global scopes."],
    parameters: MoveParameters,
    toArgv: (params) => {
      const destinationFlag = params.destination === "project" ? "--to-project" : "--to-global";
      const argv = applyScope(["move", params.name, destinationFlag], params.scope);
      return params.overwrite === true ? [...argv, "--overwrite"] : argv;
    }
  });
}

export default function registerPiNotesExtension(pi: ExtensionAPI): void {
  pi.registerCommand("notes", {
    description: "Manage notes in project (.pi/notes) or global (~/.pi/notes) scope",
    handler: async (args, ctx) => {
      await handleNotesCommand(args, ctx);
    }
  });

  registerPiNotesTools(pi);
}
