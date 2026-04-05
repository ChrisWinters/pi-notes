import { renderScopeLabel } from "../../ui/render.js";
import { defaultCreateScope } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleNew: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    ctx.ui.notify("Missing note name for /notes new.", "error");
    return;
  }

  const created = await storage.createNote({
    name,
    scope: defaultCreateScope(scopeSelection)
  });

  ctx.ui.notify(`Created ${renderScopeLabel(created.scope)} ${created.fileName}`, "info");
};
