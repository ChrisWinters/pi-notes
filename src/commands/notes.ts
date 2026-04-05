import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

import { NotesError } from "../core/errors.js";
import { NotesStorage } from "../core/storage.js";
import { NOTES_HANDLERS } from "./handlers/index.js";
import { parseNotesCommandInput } from "./parser.js";
import { NOTES_USAGE } from "./shared.js";

export async function handleNotesCommand(args: string, ctx: ExtensionCommandContext): Promise<void> {
  const parsed = parseNotesCommandInput(args);

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
    const storage = new NotesStorage({ cwd: ctx.cwd });
    await handler({
      args: parsed.args,
      scopeSelection: parsed.scopeSelection,
      storage,
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
