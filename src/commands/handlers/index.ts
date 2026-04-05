import type { NotesHandler } from "./types.js";
import { handleAppend } from "./append.js";
import { handleEdit } from "./edit.js";
import { handleGrep } from "./grep.js";
import { handleHelp } from "./help.js";
import { handleLs } from "./ls.js";
import { handleMove } from "./move.js";
import { handleNew } from "./new.js";
import { handleRewrite } from "./rewrite.js";
import { handleRm } from "./rm.js";
import { handleSetup } from "./setup.js";
import { handleShow } from "./show.js";
import { handleUninstall } from "./uninstall.js";

export const NOTES_HANDLERS: Readonly<Record<string, NotesHandler>> = {
  help: handleHelp,
  commands: handleHelp,
  setup: handleSetup,
  ls: handleLs,
  show: handleShow,
  new: handleNew,
  edit: handleEdit,
  append: handleAppend,
  rm: handleRm,
  grep: handleGrep,
  rewrite: handleRewrite,
  move: handleMove,
  uninstall: handleUninstall
};
