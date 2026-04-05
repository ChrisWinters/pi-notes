import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

import { NotesError } from "../core/errors.js";
import type { NotesScope, ScopeSelection } from "../core/storage.js";
import { NotesStorage, resolveScopePreference } from "../core/storage.js";
import { renderGrepResults, renderNoteDetails, renderNotesList, renderRewritePreview, renderScopeLabel } from "../ui/render.js";
import { parseNotesCommandInput } from "./parser.js";

const NOTES_USAGE = [
  "Usage:",
  "  /notes ls [--project|--global]",
  "  /notes show <name> [--project|--global]",
  "  /notes new <name> [--project|--global]",
  "  /notes append <name> <text> [--project|--global]",
  "  /notes rm <name> [--project|--global]",
  "  /notes grep <query> [--project|--global]",
  "  /notes rewrite <name> <instruction> [--project|--global]"
].join("\n");

function defaultCreateScope(selection: ScopeSelection): NotesScope {
  const preference = resolveScopePreference(selection);
  if (preference === "default") {
    return "project";
  }

  return preference;
}

function nowIso(): string {
  return new Date().toISOString();
}

function requireHasUi(ctx: ExtensionCommandContext): boolean {
  if (ctx.hasUI) {
    return true;
  }

  ctx.ui.notify("This subcommand requires an interactive UI session.", "error");
  return false;
}

export async function handleNotesCommand(args: string, ctx: ExtensionCommandContext): Promise<void> {
  const parsed = parseNotesCommandInput(args);
  const subcommand = parsed.subcommand;
  const rest = [...parsed.args];
  const storage = new NotesStorage({ cwd: ctx.cwd });

  if (subcommand === undefined || subcommand.length === 0) {
    ctx.ui.notify(NOTES_USAGE, "info");
    return;
  }

  try {
    if (subcommand === "ls") {
      const notes = await storage.listNotes(parsed.scopeSelection);
      ctx.ui.notify(renderNotesList(notes), "info");
      return;
    }

    if (subcommand === "show") {
      const [name] = rest;
      if (name === undefined) {
        ctx.ui.notify("Missing note name for /notes show.", "error");
        return;
      }

      const note = await storage.readNote(name, parsed.scopeSelection);
      if (note === null) {
        ctx.ui.notify(`Note not found: ${name}`, "warning");
        return;
      }

      ctx.ui.notify(renderNoteDetails(note), "info");
      return;
    }

    if (subcommand === "new") {
      const [name] = rest;
      if (name === undefined) {
        ctx.ui.notify("Missing note name for /notes new.", "error");
        return;
      }

      const scope = defaultCreateScope(parsed.scopeSelection);
      const created = await storage.createNote({
        name,
        scope
      });

      ctx.ui.notify(`Created ${renderScopeLabel(created.scope)} ${created.fileName}`, "info");
      return;
    }

    if (subcommand === "append") {
      const [name, ...textParts] = rest;
      if (name === undefined) {
        ctx.ui.notify("Missing note name for /notes append.", "error");
        return;
      }

      const text = textParts.join(" ").trim();
      if (text.length === 0) {
        ctx.ui.notify("Missing append text for /notes append.", "error");
        return;
      }

      const updated = await storage.appendToNote({
        name,
        text,
        selection: parsed.scopeSelection,
        updatedIso: nowIso()
      });

      ctx.ui.notify(`Updated ${renderScopeLabel(updated.scope)} ${updated.fileName}`, "info");
      return;
    }

    if (subcommand === "rm") {
      const [name] = rest;
      if (name === undefined) {
        ctx.ui.notify("Missing note name for /notes rm.", "error");
        return;
      }

      const target = await storage.readNote(name, parsed.scopeSelection);
      if (target === null) {
        ctx.ui.notify(`Note not found: ${name}`, "warning");
        return;
      }

      if (!requireHasUi(ctx)) {
        return;
      }

      const confirmed = await ctx.ui.confirm(
        "Delete note?",
        `Delete ${renderScopeLabel(target.scope)} ${target.fileName}? This cannot be undone.`
      );

      if (!confirmed) {
        ctx.ui.notify("Delete cancelled.", "info");
        return;
      }

      await storage.deleteNote(name, parsed.scopeSelection);
      ctx.ui.notify(`Deleted ${renderScopeLabel(target.scope)} ${target.fileName}`, "info");
      return;
    }

    if (subcommand === "grep") {
      const query = rest.join(" ").trim();
      if (query.length === 0) {
        ctx.ui.notify("Missing query for /notes grep.", "error");
        return;
      }

      const matches = await storage.grepNotes(query, parsed.scopeSelection);
      ctx.ui.notify(renderGrepResults(query, matches), "info");
      return;
    }

    if (subcommand === "rewrite") {
      const [name, ...instructionParts] = rest;
      if (name === undefined) {
        ctx.ui.notify("Missing note name for /notes rewrite.", "error");
        return;
      }

      const instruction = instructionParts.join(" ").trim();
      if (instruction.length === 0) {
        ctx.ui.notify("Missing rewrite instruction for /notes rewrite.", "error");
        return;
      }

      const target = await storage.readNote(name, parsed.scopeSelection);
      if (target === null) {
        ctx.ui.notify(`Note not found: ${name}`, "warning");
        return;
      }

      if (!requireHasUi(ctx)) {
        return;
      }

      const proposedMarkdown = await ctx.ui.editor(
        `Rewrite proposal for ${target.fileName}`,
        target.markdown
      );

      if (proposedMarkdown === undefined) {
        ctx.ui.notify("Rewrite cancelled.", "info");
        return;
      }

      ctx.ui.notify(renderRewritePreview(target.markdown, proposedMarkdown), "info");

      const confirmed = await ctx.ui.confirm(
        "Apply rewrite?",
        `Apply rewrite to ${renderScopeLabel(target.scope)} ${target.fileName}?`
      );

      if (!confirmed) {
        ctx.ui.notify("Rewrite cancelled.", "info");
        return;
      }

      const updated = await storage.writeNote({
        name: target.name,
        scope: target.scope,
        markdown: proposedMarkdown,
        updatedIso: nowIso()
      });

      ctx.ui.notify(
        `Rewrote ${renderScopeLabel(updated.scope)} ${updated.fileName} (instruction: ${instruction})`,
        "info"
      );
      return;
    }

    ctx.ui.notify(`Unknown /notes subcommand: ${subcommand}\n\n${NOTES_USAGE}`, "error");
  } catch (error: unknown) {
    if (error instanceof NotesError) {
      ctx.ui.notify(error.message, "error");
      return;
    }

    throw error;
  }
}
