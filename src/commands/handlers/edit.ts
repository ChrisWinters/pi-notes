import { renderScopeLabel } from "../../ui/render.js";
import { nowIso, requireHasUi } from "../shared.js";
import { notifyCancelled, notifyFailure } from "../context.js";
import type { NotesHandler } from "./types.js";

export const handleEdit: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    notifyFailure(ctx, "Missing note name for /notes edit.");
    return;
  }

  const note = await storage.readNote(name, scopeSelection);
  if (note === null) {
    notifyFailure(ctx, `Note not found: ${name}`, "warning");
    return;
  }

  if (!requireHasUi(ctx)) {
    return;
  }

  const editedMarkdown = await ctx.ui.editor(`Edit ${note.fileName}`, note.markdown);
  if (editedMarkdown === undefined) {
    notifyCancelled(ctx, "Edit cancelled.");
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
