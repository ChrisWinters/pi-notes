import { renderNoteDetails } from "../../ui/render.js";
import type { NotesHandler } from "./types.js";

export const handleShow: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    ctx.ui.notify("Missing note name for /notes show.", "error");
    return;
  }

  const note = await storage.readNote(name, scopeSelection);
  if (note === null) {
    ctx.ui.notify(`Note not found: ${name}`, "warning");
    return;
  }

  ctx.ui.notify(renderNoteDetails(note), "info");
};
