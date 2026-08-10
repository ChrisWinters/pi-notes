import {
  CONFIG_DIR_NAME,
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  formatSize,
  truncateHead,
  withFileMutationQueue,
  type AgentToolResult,
  type ExtensionAPI,
  type ExtensionContext,
  type TruncationResult
} from "@earendil-works/pi-coding-agent";
import { Type, type Static, type TSchema, type TUnsafe } from "typebox";

import type { NotesCommandStatus, NotesNotifyLevel } from "./commands/context.js";
import { handleNotesCommand, handleNotesCommandArgv } from "./commands/notes.js";
import { createQueuedMutationCoordinator } from "./core/mutation.js";
import {
  OUTPUT_ARTIFACT_RETENTION_MS,
  cleanupExpiredToolOutputArtifacts,
  persistFullToolOutput
} from "./core/output-artifact.js";

const NOTES_SETUP_TOOL_NAME = "notes_setup";
const NOTES_LIST_TOOL_NAME = "notes_list";
const NOTES_SHOW_TOOL_NAME = "notes_show";
const NOTES_NEW_TOOL_NAME = "notes_new";
const NOTES_APPEND_TOOL_NAME = "notes_append";
const NOTES_GREP_TOOL_NAME = "notes_grep";
const NOTES_RENAME_TOOL_NAME = "notes_rename";
const NOTES_MOVE_TOOL_NAME = "notes_move";

const piMutationCoordinator = createQueuedMutationCoordinator(withFileMutationQueue);

const NOTES_SCOPE_VALUES = ["default", "project", "global"] as const;
const NOTES_MOVE_DESTINATION_VALUES = ["project", "global"] as const;
const OUTPUT_LIMIT_DESCRIPTION = `Output is truncated to ${DEFAULT_MAX_LINES} lines or ${formatSize(DEFAULT_MAX_BYTES)}; complete truncated output uses an owner-only temporary artifact scheduled for deletion after 24 hours.`;

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
  readonly status: NotesCommandStatus;
  readonly truncation?: TruncationResult;
  readonly fullOutputPath?: string;
  readonly artifactRetentionMs?: number;
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

async function executeNotesTool(
  tool: string,
  argv: readonly string[],
  signal: AbortSignal | undefined,
  ctx: ExtensionContext
): Promise<NotesToolResult> {
  const messages: NotesToolMessage[] = [];

  const outcome = await handleNotesCommandArgv(argv, {
    cwd: ctx.cwd,
    configDirName: CONFIG_DIR_NAME,
    mutationCoordinator: piMutationCoordinator,
    ...(signal === undefined ? {} : { signal }),
    hasUI: false,
    ui: {
      notify: (message, level) => {
        messages.push({ message, level });
      },
      confirm: () => Promise.resolve(false),
      editor: () => Promise.resolve(undefined)
    }
  });

  const ok = outcome.status === "success";
  const rawText = messages.length > 0
    ? messages.map((message) => message.message).join("\n")
    : "No output from notes command.";

  if (!ok) {
    const overwriteHandoff = rawText.includes("Destination already has note:")
      && (tool === NOTES_MOVE_TOOL_NAME || tool === NOTES_RENAME_TOOL_NAME)
      ? `\nTo overwrite interactively, run: /notes ${argv.map(formatCommandToken).join(" ")} --overwrite`
      : "";
    throw new Error(`${rawText}${overwriteHandoff}`);
  }

  const initialTruncation = truncateHead(rawText, {
    maxBytes: DEFAULT_MAX_BYTES,
    maxLines: DEFAULT_MAX_LINES
  });
  if (initialTruncation.truncated) {
    const fullOutputPath = await persistFullToolOutput(rawText);
    const notice = `\n\n[Output truncated: Full output saved to: ${fullOutputPath}]`;
    const noticeBytes = Buffer.byteLength(notice, "utf8");
    if (noticeBytes >= DEFAULT_MAX_BYTES) {
      throw new Error("Temporary output artifact path is too long for a bounded tool result.");
    }
    const truncation = truncateHead(rawText, {
      maxBytes: DEFAULT_MAX_BYTES - noticeBytes,
      maxLines: DEFAULT_MAX_LINES - 2
    });
    const text = `${truncation.content}${notice}`;
    return {
      content: [{ type: "text", text }],
      details: {
        tool,
        argv,
        ok,
        status: outcome.status,
        truncation,
        fullOutputPath,
        artifactRetentionMs: OUTPUT_ARTIFACT_RETENTION_MS
      }
    };
  }

  return {
    content: [{ type: "text", text: initialTruncation.content }],
    details: {
      tool,
      argv,
      ok,
      status: outcome.status
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
  scope: Type.Optional(createNotesScopeParameterSchema())
});
const MoveParameters = Type.Object({
  name: Type.String({ description: "Note name." }),
  destination: createNotesMoveDestinationParameterSchema(),
  scope: Type.Optional(createNotesScopeParameterSchema())
});

function formatCommandToken(token: string): string {
  return /^[a-zA-Z0-9._/-]+$/.test(token) ? token : JSON.stringify(token);
}

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
    execute: async (_toolCallId, params, signal, _onUpdate, ctx) => {
      return executeNotesTool(tool.name, tool.toArgv(params), signal, ctx);
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
    description: `List notes in project, global, or default scope. ${OUTPUT_LIMIT_DESCRIPTION}`,
    promptSnippet: "List pi-notes notes in project or global scope.",
    promptGuidelines: ["Use notes_list when the user asks to list or browse pi-notes notes."],
    parameters: ScopeParameters,
    toArgv: (params) => applyScope(["ls"], params.scope)
  });

  registerNotesTool(pi, {
    name: NOTES_SHOW_TOOL_NAME,
    label: "Show Note",
    description: `Show a note by name from project, global, or default scope. ${OUTPUT_LIMIT_DESCRIPTION}`,
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
    description: `Search notes for a query in project, global, or default scope. ${OUTPUT_LIMIT_DESCRIPTION}`,
    promptSnippet: "Search pi-notes notes by query.",
    promptGuidelines: ["Use notes_grep when the user asks to search or grep notes."],
    parameters: GrepParameters,
    toArgv: (params) => applyScope(["grep", params.query], params.scope)
  });

  registerNotesTool(pi, {
    name: NOTES_RENAME_TOOL_NAME,
    label: "Rename Note",
    description: "Rename a note. Overwrite conflicts require an interactive /notes command.",
    promptSnippet: "Rename a pi-notes note.",
    promptGuidelines: ["Use notes_rename when the user asks to rename a note and source, destination, and scope are clear."],
    parameters: RenameParameters,
    toArgv: (params) => applyScope(["rename", params.fromName, params.toName], params.scope)
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
      return applyScope(["move", params.name, destinationFlag], params.scope);
    }
  });
}

export default function registerPiNotesExtension(pi: ExtensionAPI): void {
  void cleanupExpiredToolOutputArtifacts();

  pi.registerCommand("notes", {
    description: "Manage notes in project (.pi/notes) or global (~/.pi/notes) scope",
    handler: async (args, ctx) => {
      if (!ctx.hasUI) {
        const cliArgs = args.trim().length === 0 ? "help" : args;
        throw new Error(
          `Direct /notes commands are unsupported in ${ctx.mode} mode. Use the standalone CLI instead: pi-notes ${cliArgs}`
        );
      }

      await handleNotesCommand(args, {
        ...ctx,
        configDirName: CONFIG_DIR_NAME,
        mutationCoordinator: piMutationCoordinator
      });
    }
  });

  registerPiNotesTools(pi);
}
