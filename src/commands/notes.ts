import { NotesError } from "../core/errors.js";
import { NotesStorage } from "../core/storage.js";
import { notifyFailure, type NotesCommandContext, type NotesCommandOutcome, type NotesCommandStatus } from "./context.js";
import { NOTES_HANDLERS } from "./handlers/index.js";
import { parseNotesCommandArgv, parseNotesCommandInput, type ParsedNotesCommand } from "./parser.js";
import { NOTES_USAGE } from "./shared.js";

async function handleParsedNotesCommand(
  parsed: ParsedNotesCommand,
  ctx: NotesCommandContext,
  storage?: NotesStorage
): Promise<NotesCommandOutcome> {
  let status: NotesCommandStatus = "success";
  const commandContext: NotesCommandContext = {
    ...ctx,
    outcomeSink: {
      setStatus: (nextStatus) => {
        status = nextStatus;
      }
    }
  };

  if (parsed.subcommand === undefined || parsed.subcommand.length === 0) {
    commandContext.ui.notify(NOTES_USAGE, "info");
    return { status };
  }

  const handler = NOTES_HANDLERS[parsed.subcommand];
  if (handler === undefined) {
    notifyFailure(commandContext, `Unknown /notes subcommand: ${parsed.subcommand}\n\n${NOTES_USAGE}`);
    return { status: "failure" };
  }

  try {
    const resolvedStorage = storage ?? new NotesStorage({
      cwd: ctx.cwd,
      ...(ctx.configDirName === undefined ? {} : { configDirName: ctx.configDirName }),
      ...(ctx.mutationCoordinator === undefined ? {} : { mutationCoordinator: ctx.mutationCoordinator }),
      ...(ctx.signal === undefined ? {} : { signal: ctx.signal })
    });
    await handler({
      args: parsed.args,
      scopeSelection: parsed.scopeSelection,
      moveSelection: parsed.moveSelection,
      storage: resolvedStorage,
      ctx: commandContext
    });
  } catch (error: unknown) {
    if (error instanceof NotesError) {
      notifyFailure(commandContext, error.message);
      return { status: "failure" };
    }

    throw error;
  }

  return { status };
}

export async function handleNotesCommand(args: string, ctx: NotesCommandContext): Promise<NotesCommandOutcome> {
  const parsed = parseNotesCommandInput(args);
  return handleParsedNotesCommand(parsed, ctx);
}

export async function handleNotesCommandArgv(
  argv: readonly string[],
  ctx: NotesCommandContext
): Promise<NotesCommandOutcome> {
  const parsed = parseNotesCommandArgv(argv);
  return handleParsedNotesCommand(parsed, ctx);
}
