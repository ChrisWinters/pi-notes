import { NotesError } from "../core/errors.js";
import { NotesStorage } from "../core/storage.js";
import type { NotesCommandContext } from "./context.js";
import { NOTES_HANDLERS } from "./handlers/index.js";
import { parseNotesCommandArgv, parseNotesCommandInput, type ParsedNotesCommand } from "./parser.js";
import { NOTES_USAGE } from "./shared.js";

async function handleParsedNotesCommand(
  parsed: ParsedNotesCommand,
  ctx: NotesCommandContext,
  storage?: NotesStorage
): Promise<void> {
  if (parsed.subcommand === undefined || parsed.subcommand.length === 0) {
    ctx.ui.notify(NOTES_USAGE, "info");
    return;
  }

  const handler = NOTES_HANDLERS[parsed.subcommand];
  if (handler === undefined) {
    ctx.ui.notify(`Unknown /notes subcommand: ${parsed.subcommand}\n\n${NOTES_USAGE}`, "error");
    return;
  }

  try {
    const resolvedStorage = storage ?? new NotesStorage({
      cwd: ctx.cwd,
      ...(ctx.configDirName === undefined ? {} : { configDirName: ctx.configDirName })
    });
    await handler({
      args: parsed.args,
      scopeSelection: parsed.scopeSelection,
      moveSelection: parsed.moveSelection,
      storage: resolvedStorage,
      ctx
    });
  } catch (error: unknown) {
    if (error instanceof NotesError) {
      ctx.ui.notify(error.message, "error");
      return;
    }

    throw error;
  }
}

export async function handleNotesCommand(args: string, ctx: NotesCommandContext): Promise<void> {
  const parsed = parseNotesCommandInput(args);
  await handleParsedNotesCommand(parsed, ctx);
}

export async function handleNotesCommandArgv(argv: readonly string[], ctx: NotesCommandContext): Promise<void> {
  const parsed = parseNotesCommandArgv(argv);
  await handleParsedNotesCommand(parsed, ctx);
}
