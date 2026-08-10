import { renderScopeLabel } from "../../ui/render.js";
import { nowIso } from "../shared.js";
import { notifyFailure } from "../context.js";
import type { NotesHandler } from "./types.js";

export const handleAppend: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name, ...textParts] = args;
  if (name === undefined) {
    notifyFailure(ctx, "Missing note name for /notes append.");
    return;
  }

  const text = textParts.join(" ").trim();
  if (text.length === 0) {
    notifyFailure(ctx, "Missing append text for /notes append.");
    return;
  }

  const updated = await storage.appendToNote({
    name,
    text,
    selection: scopeSelection,
    updatedIso: nowIso()
  });

  ctx.ui.notify(`Updated ${renderScopeLabel(updated.scope)} ${updated.fileName}`, "info");
};
