import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

import type { NotesScope, ScopeSelection } from "../core/storage.js";
import { resolveScopePreference } from "../core/storage.js";

export const NOTES_USAGE = [
  "Usage:",
  "  /notes ls [--project|--global]",
  "  /notes show <name> [--project|--global]",
  "  /notes new <name> [--project|--global]",
  "  /notes append <name> <text> [--project|--global]",
  "  /notes rm <name> [--project|--global]",
  "  /notes grep <query> [--project|--global]",
  "  /notes rewrite <name> <instruction> [--project|--global]"
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

export function requireHasUi(ctx: ExtensionCommandContext): boolean {
  if (ctx.hasUI) {
    return true;
  }

  ctx.ui.notify("This subcommand requires an interactive UI session.", "error");
  return false;
}
