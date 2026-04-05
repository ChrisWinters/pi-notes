import type { NotesHandler } from "./types.js";
import { handleAppend } from "./append.js";
import { handleGrep } from "./grep.js";
import { handleLs } from "./ls.js";
import { handleNew } from "./new.js";
import { handleRewrite } from "./rewrite.js";
import { handleRm } from "./rm.js";
import { handleShow } from "./show.js";

export const NOTES_HANDLERS: Readonly<Record<string, NotesHandler>> = {
  ls: handleLs,
  show: handleShow,
  new: handleNew,
  append: handleAppend,
  rm: handleRm,
  grep: handleGrep,
  rewrite: handleRewrite
};
