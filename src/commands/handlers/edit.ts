import { renderScopeLabel } from "../../ui/render.js";
import { nowIso, requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleEdit: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    ctx.ui.notify("Missing note name for /notes edit.", "error");
    return;
  }

  const note = await storage.readNote(name, scopeSelection);
  if (note === null) {
    ctx.ui.notify(`Note not found: ${name}`, "warning");
    return;
  }

  if (!requireHasUi(ctx)) {
    return;
  }

  const editedMarkdown = await ctx.ui.editor(`Edit ${note.fileName}`, note.markdown);
  if (editedMarkdown === undefined) {
    ctx.ui.notify("Edit cancelled.", "info");
    return;
  }

  const updated = await storage.writeNote({
    name: note.name,
    scope: note.scope,
    markdown: editedMarkdown,
    updatedIso: nowIso()
  });

  ctx.ui.notify(`Edited ${renderScopeLabel(updated.scope)} ${updated.fileName}`, "info");
};
