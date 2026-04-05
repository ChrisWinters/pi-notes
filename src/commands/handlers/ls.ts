import { renderNotesList } from "../../ui/render.js";
import type { NotesHandler } from "./types.js";

export const handleLs: NotesHandler = async ({ storage, scopeSelection, ctx }) => {
  const notes = await storage.listNotes(scopeSelection);
  ctx.ui.notify(renderNotesList(notes), "info");
};
