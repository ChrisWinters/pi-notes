import { renderNoteDetails } from "../../ui/render.js";
import { notifyFailure } from "../context.js";
import type { NotesHandler } from "./types.js";

export const handleShow: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    notifyFailure(ctx, "Missing note name for /notes show.");
    return;
  }

  const note = await storage.readNote(name, scopeSelection);
  if (note === null) {
    notifyFailure(ctx, `Note not found: ${name}`, "warning");
    return;
  }

  ctx.ui.notify(renderNoteDetails(note), "info");
};
