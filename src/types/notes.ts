import type { NotesScope } from "../core/storage.js";

export interface NoteRecord {
  readonly name: string;
  readonly path: string;
  readonly scope: NotesScope;
}
