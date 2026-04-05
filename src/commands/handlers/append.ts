import { renderScopeLabel } from "../../ui/render.js";
import { nowIso } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleAppend: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name, ...textParts] = args;
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
    selection: scopeSelection,
    updatedIso: nowIso()
  });

  ctx.ui.notify(`Updated ${renderScopeLabel(updated.scope)} ${updated.fileName}`, "info");
};
