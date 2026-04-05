import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

import type { ScopeSelection } from "../../core/storage.js";
import type { NotesStorage } from "../../core/storage.js";

export interface NotesHandlerContext {
  readonly args: readonly string[];
  readonly scopeSelection: ScopeSelection;
  readonly storage: NotesStorage;
  readonly ctx: ExtensionCommandContext;
}

export type NotesHandler = (context: NotesHandlerContext) => Promise<void>;
