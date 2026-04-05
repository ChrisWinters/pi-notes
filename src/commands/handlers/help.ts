import { NOTES_USAGE } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleHelp: NotesHandler = ({ ctx }) => {
  ctx.ui.notify(NOTES_USAGE, "info");
  return Promise.resolve();
};
