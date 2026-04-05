import type { StoredNote, NotesScope } from "../core/storage.js";

export function renderScopeLabel(scope: NotesScope): string {
  return scope === "project" ? "[project]" : "[global]";
}

export function renderNotesList(notes: readonly StoredNote[]): string {
  if (notes.length === 0) {
    return "No notes found.";
  }

  const lines = ["Notes:"];
  for (const note of notes) {
    lines.push(`- ${renderScopeLabel(note.scope)} ${note.fileName}`);
  }

  return lines.join("\n");
}

export function renderNoteDetails(note: StoredNote): string {
  return [
    `${renderScopeLabel(note.scope)} ${note.fileName}`,
    `Path: ${note.path}`,
    "",
    note.markdown
  ].join("\n");
}
