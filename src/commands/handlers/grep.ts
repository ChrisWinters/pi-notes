import { renderGrepResults } from "../../ui/render.js";
import type { NotesHandler } from "./types.js";

export const handleGrep: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const query = args.join(" ").trim();
  if (query.length === 0) {
    ctx.ui.notify("Missing query for /notes grep.", "error");
    return;
  }

  const matches = await storage.grepNotes(query, scopeSelection);
  ctx.ui.notify(renderGrepResults(query, matches), "info");
};
