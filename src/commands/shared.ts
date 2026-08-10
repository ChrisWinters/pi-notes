import type { NotesScope, NotesStorage, ScopeSelection, StoredNote } from "../core/storage.js";
import { notifyFailure, type NotesCommandContext } from "./context.js";
import { resolveScopePreference } from "../core/storage.js";

export const NOTES_USAGE = [
  "Usage:",
  "  /notes",
  "  /notes help",
  "  /notes commands",
  "  /notes setup",
  "  /notes ls [--project|--global]",
  "  /notes show <name> [--project|--global]",
  "  /notes new <name> [--project|--global]",
  "  /notes edit <name> [--project|--global]",
  "  /notes append <name> <text> [--project|--global]",
  "  /notes rm <name> [--project|--global]",
  "  /notes grep <query> [--project|--global]",
  "  /notes rewrite <name> <instruction> [--project|--global]",
  "  /notes move <name> --to-global|--to-project [--project|--global] [--overwrite]",
  "  /notes rename <from> <to> [--project|--global] [--overwrite]",
  "  /notes uninstall [--project] [--global]"
].join("\n");

export function defaultCreateScope(selection: ScopeSelection): NotesScope {
  const preference = resolveScopePreference(selection);
  if (preference === "default") {
    return "project";
  }

  return preference;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function requireHasUi(ctx: NotesCommandContext): boolean {
  if (ctx.hasUI) {
    return true;
  }

  notifyFailure(ctx, "This subcommand requires an interactive UI session.");
  return false;
}

export async function resolveInteractiveNote(
  name: string,
  storage: NotesStorage,
  selection: ScopeSelection,
  ctx: NotesCommandContext
): Promise<StoredNote | null> {
  const note = await storage.readNote(name, selection);
  if (note === null) {
    notifyFailure(ctx, `Note not found: ${name}`, "warning");
    return null;
  }

  return requireHasUi(ctx) ? note : null;
}

export function renderSetupStarterNote(now: string): string {
  return [
    "---",
    "title: note",
    `updated: ${now}`,
    "---",
    "",
    "## Welcome to notes",
    "",
    "Use /notes new <name> to create notes.",
    "Use /notes edit <name> to preserve markdown formatting.",
    "Use /notes ls to browse notes in project/global scope.",
    "Use /notes move <name> --to-global or --to-project to reorganize.",
    "",
    "Tip: run /notes show note --global anytime to re-open this starter note."
  ].join("\n");
}
