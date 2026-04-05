export type NotesScope = "project" | "global";

export interface ScopeSelection {
  readonly forceProject: boolean;
  readonly forceGlobal: boolean;
}

export function resolveScopePreference(selection: ScopeSelection): NotesScope | "default" {
  if (selection.forceProject && selection.forceGlobal) {
    throw new Error("Scope flags conflict: choose either --project or --global.");
  }

  if (selection.forceProject) {
    return "project";
  }

  if (selection.forceGlobal) {
    return "global";
  }

  return "default";
}
