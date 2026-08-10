import { renderScopeLabel } from "../../ui/render.js";
import { resolveInteractiveNote } from "../shared.js";
import { notifyCancelled, notifyFailure } from "../context.js";
import type { NotesHandler } from "./types.js";

export const handleRm: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    notifyFailure(ctx, "Missing note name for /notes rm.");
    return;
  }

  const target = await resolveInteractiveNote(name, storage, scopeSelection, ctx);
  if (target === null) {
    return;
  }

  const confirmed = await ctx.ui.confirm(
    "Delete note?",
    `Delete ${renderScopeLabel(target.scope)} ${target.fileName}? This cannot be undone.`
  );

  if (!confirmed) {
    notifyCancelled(ctx, "Delete cancelled.");
    return;
  }

  await storage.deleteNote(name, scopeSelection);
  ctx.ui.notify(`Deleted ${renderScopeLabel(target.scope)} ${target.fileName}`, "info");
};
