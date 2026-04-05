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

export function renderGrepResults(query: string, notes: readonly StoredNote[]): string {
  if (notes.length === 0) {
    return `No notes matched query: ${query}`;
  }

  const lines = [`Search results for: ${query}`];
  for (const note of notes) {
    lines.push(`- ${renderScopeLabel(note.scope)} ${note.fileName}`);
  }

  return lines.join("\n");
}

function previewFirstLines(markdown: string, maxLines: number): string {
  const lines = markdown.split("\n");
  if (lines.length <= maxLines) {
    return markdown;
  }

  return `${lines.slice(0, maxLines).join("\n")}\n...`;
}

export function renderRewritePreview(currentMarkdown: string, proposedMarkdown: string): string {
  return [
    "Rewrite preview (first 12 lines)",
    "",
    "Current:",
    previewFirstLines(currentMarkdown, 12),
    "",
    "Proposed:",
    previewFirstLines(proposedMarkdown, 12)
  ].join("\n");
}
