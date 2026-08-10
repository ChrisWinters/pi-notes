import { renderScopeLabel } from "../../ui/render.js";
import { defaultCreateScope } from "../shared.js";
import { notifyFailure } from "../context.js";
import type { NotesHandler } from "./types.js";

export const handleNew: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    notifyFailure(ctx, "Missing note name for /notes new.");
    return;
  }

  const created = await storage.createNote({
    name,
    scope: defaultCreateScope(scopeSelection)
  });

  ctx.ui.notify(`Created ${renderScopeLabel(created.scope)} ${created.fileName}`, "info");
};
