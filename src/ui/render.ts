import type { NotesScope } from "../core/storage.js";

export function renderScopeLabel(scope: NotesScope): string {
  return scope === "project" ? "[project]" : "[global]";
}
