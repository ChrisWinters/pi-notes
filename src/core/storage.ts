import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

import { NotesError } from "./errors.js";
import { createEmptyNoteMarkdown, parseNoteMarkdown, withUpdatedTimestamp } from "./format.js";
import { assertSafeNoteFileName, normalizeNoteName } from "./naming.js";

export type NotesScope = "project" | "global";

export interface ScopeSelection {
  readonly forceProject: boolean;
  readonly forceGlobal: boolean;
}

export interface NotesStorageOptions {
  readonly cwd: string;
  readonly globalNotesDir?: string;
}

export interface StoredNote {
  readonly name: string;
  readonly fileName: string;
  readonly path: string;
  readonly scope: NotesScope;
  readonly markdown: string;
}

export interface CreateNoteInput {
  readonly name: string;
  readonly title?: string;
  readonly scope: NotesScope;
}

export interface WriteNoteInput {
  readonly name: string;
  readonly markdown: string;
  readonly scope: NotesScope;
  readonly updatedIso: string;
}

export interface AppendNoteInput {
  readonly name: string;
  readonly text: string;
  readonly selection: ScopeSelection;
  readonly updatedIso: string;
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export function resolveScopePreference(selection: ScopeSelection): NotesScope | "default" {
  if (selection.forceProject && selection.forceGlobal) {
    throw new NotesError("Scope flags conflict: choose either --project or --global.");
  }

  if (selection.forceProject) {
    return "project";
  }

  if (selection.forceGlobal) {
    return "global";
  }

  return "default";
}

export class NotesStorage {
  private readonly cwd: string;
  private readonly globalNotesDir: string;

  public constructor(options: NotesStorageOptions) {
    this.cwd = options.cwd;
    this.globalNotesDir = options.globalNotesDir ?? join(homedir(), ".pi", "notes");
  }

  public getNotesDirectory(scope: NotesScope): string {
    if (scope === "project") {
      return join(this.cwd, ".pi", "notes");
    }

    return this.globalNotesDir;
  }

  public getNotePath(scope: NotesScope, fileName: string): string {
    assertSafeNoteFileName(fileName);
    return join(this.getNotesDirectory(scope), fileName);
  }

  public async ensureScopeDirectory(scope: NotesScope): Promise<string> {
    const directory = this.getNotesDirectory(scope);
    await mkdir(directory, { recursive: true });
    return directory;
  }

  public async noteExists(scope: NotesScope, fileName: string): Promise<boolean> {
    assertSafeNoteFileName(fileName);

    try {
      await access(this.getNotePath(scope, fileName));
      return true;
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return false;
      }

      throw error;
    }
  }

  public async createNote(input: CreateNoteInput): Promise<StoredNote> {
    const fileName = normalizeNoteName(input.name);
    const targetPath = this.getNotePath(input.scope, fileName);

    if (await this.noteExists(input.scope, fileName)) {
      throw new NotesError(`Note already exists: ${fileName}`);
    }

    await this.ensureScopeDirectory(input.scope);

    const nowIso = new Date().toISOString();
    const title = input.title?.trim().length ? input.title : input.name.trim();
    const markdown = createEmptyNoteMarkdown(title, nowIso);

    await writeFile(targetPath, markdown, "utf8");

    return {
      name: fileName.slice(0, -3),
      fileName,
      path: targetPath,
      scope: input.scope,
      markdown
    };
  }

  public async readNoteByFileName(fileName: string, selection: ScopeSelection): Promise<StoredNote | null> {
    assertSafeNoteFileName(fileName);
    const scopePreference = resolveScopePreference(selection);

    if (scopePreference === "project" || scopePreference === "global") {
      return this.readFromScope(scopePreference, fileName);
    }

    const projectMatch = await this.readFromScope("project", fileName);
    if (projectMatch !== null) {
      return projectMatch;
    }

    return this.readFromScope("global", fileName);
  }

  public async readNote(name: string, selection: ScopeSelection): Promise<StoredNote | null> {
    const fileName = normalizeNoteName(name);
    return this.readNoteByFileName(fileName, selection);
  }

  public async writeNote(input: WriteNoteInput): Promise<StoredNote> {
    const fileName = normalizeNoteName(input.name);
    const targetPath = this.getNotePath(input.scope, fileName);

    await this.ensureScopeDirectory(input.scope);

    const updatedMarkdown = withUpdatedTimestamp(input.markdown, input.updatedIso);
    await writeFile(targetPath, updatedMarkdown, "utf8");

    return {
      name: fileName.slice(0, -3),
      fileName,
      path: targetPath,
      scope: input.scope,
      markdown: updatedMarkdown
    };
  }

  public async appendToNote(input: AppendNoteInput): Promise<StoredNote> {
    const existing = await this.readNote(input.name, input.selection);

    if (existing === null) {
      throw new NotesError(`Cannot append. Note not found: ${input.name}`);
    }

    const separator = existing.markdown.endsWith("\n") ? "" : "\n";
    const nextMarkdown = `${existing.markdown}${separator}${input.text}\n`;

    return this.writeNote({
      name: existing.name,
      markdown: nextMarkdown,
      scope: existing.scope,
      updatedIso: input.updatedIso
    });
  }

  public async deleteNote(name: string, selection: ScopeSelection): Promise<boolean> {
    const existing = await this.readNote(name, selection);

    if (existing === null) {
      return false;
    }

    await rm(existing.path);
    return true;
  }

  public async listNotes(selection: ScopeSelection): Promise<readonly StoredNote[]> {
    const scopePreference = resolveScopePreference(selection);

    if (scopePreference === "project" || scopePreference === "global") {
      return this.listFromScope(scopePreference);
    }

    const [projectNotes, globalNotes] = await Promise.all([
      this.listFromScope("project"),
      this.listFromScope("global")
    ]);

    const merged = new Map<string, StoredNote>();
    for (const note of globalNotes) {
      merged.set(note.fileName, note);
    }

    for (const note of projectNotes) {
      merged.set(note.fileName, note);
    }

    return [...merged.values()].sort((a, b) => a.fileName.localeCompare(b.fileName));
  }

  private async readFromScope(scope: NotesScope, fileName: string): Promise<StoredNote | null> {
    const path = this.getNotePath(scope, fileName);

    try {
      const markdown = await readFile(path, "utf8");
      parseNoteMarkdown(markdown);

      return {
        name: fileName.slice(0, -3),
        fileName,
        path,
        scope,
        markdown
      };
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return null;
      }

      throw error;
    }
  }

  private async listFromScope(scope: NotesScope): Promise<readonly StoredNote[]> {
    const directory = this.getNotesDirectory(scope);

    let files: readonly string[] = [];
    try {
      files = await readdir(directory);
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return [];
      }

      throw error;
    }

    const notes: StoredNote[] = [];
    for (const file of files) {
      if (!file.endsWith(".md")) {
        continue;
      }

      try {
        assertSafeNoteFileName(file);
      } catch {
        continue;
      }

      const note = await this.readFromScope(scope, file);
      if (note !== null) {
        notes.push(note);
      }
    }

    return notes.sort((a, b) => a.fileName.localeCompare(b.fileName));
  }
}
