import type { ScopeSelection } from "../../core/storage.js";
import type { NotesStorage } from "../../core/storage.js";
import type { NotesCommandContext } from "../context.js";
import type { MoveSelection } from "../parser.js";

export interface NotesHandlerContext {
  readonly args: readonly string[];
  readonly scopeSelection: ScopeSelection;
  readonly moveSelection: MoveSelection;
  readonly storage: NotesStorage;
  readonly ctx: NotesCommandContext;
}

export type NotesHandler = (context: NotesHandlerContext) => Promise<void>;
