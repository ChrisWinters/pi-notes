import { access, mkdir, open, readdir, readFile, rm, writeFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
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

export interface SetupNotesInput {
  readonly starterGlobalMarkdown: string;
}

export interface SetupNotesResult {
  readonly projectDirectoryPath: string;
  readonly globalDirectoryPath: string;
  readonly starterGlobalNotePath: string;
  readonly createdProjectDirectory: boolean;
  readonly createdGlobalDirectory: boolean;
  readonly createdStarterGlobalNote: boolean;
}

export interface MoveNoteInput {
  readonly name: string;
  readonly selection: ScopeSelection;
  readonly destinationScope: NotesScope;
  readonly overwrite: boolean;
}

export interface MoveNoteResult {
  readonly source: StoredNote;
  readonly destination: StoredNote;
  readonly overwrittenDestination: boolean;
}

export interface RenameNoteInput {
  readonly fromName: string;
  readonly toName: string;
  readonly selection: ScopeSelection;
  readonly overwrite: boolean;
}

export interface RenameNoteResult {
  readonly source: StoredNote;
  readonly destination: StoredNote;
  readonly overwrittenDestination: boolean;
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function isAlreadyExists(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
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
  private static readonly mutationQueues = new Map<string, Promise<void>>();

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

  public async setupNotes(input: SetupNotesInput): Promise<SetupNotesResult> {
    const projectDirectoryPath = this.getNotesDirectory("project");
    const globalDirectoryPath = this.getNotesDirectory("global");
    const starterFileName = normalizeNoteName("note");
    const starterGlobalNotePath = this.getNotePath("global", starterFileName);

    const createdProjectDirectory = !(await this.pathExists(projectDirectoryPath));
    await mkdir(projectDirectoryPath, { recursive: true });

    const createdGlobalDirectory = !(await this.pathExists(globalDirectoryPath));
    await mkdir(globalDirectoryPath, { recursive: true });

    let createdStarterGlobalNote = false;
    let handle: FileHandle | undefined;
    try {
      handle = await open(starterGlobalNotePath, "wx");
      await handle.writeFile(input.starterGlobalMarkdown, "utf8");
      createdStarterGlobalNote = true;
    } catch (error: unknown) {
      if (!isAlreadyExists(error)) {
        throw error;
      }
    } finally {
      await handle?.close();
    }

    return {
      projectDirectoryPath,
      globalDirectoryPath,
      starterGlobalNotePath,
      createdProjectDirectory,
      createdGlobalDirectory,
      createdStarterGlobalNote
    };
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

    await this.ensureScopeDirectory(input.scope);

    const nowIso = new Date().toISOString();
    const title = input.title?.trim().length ? input.title : input.name.trim();
    const markdown = createEmptyNoteMarkdown(title, nowIso);

    let handle: FileHandle | undefined;
    try {
      handle = await open(targetPath, "wx");
      await handle.writeFile(markdown, "utf8");
    } catch (error: unknown) {
      if (isAlreadyExists(error)) {
        throw new NotesError(`Note already exists: ${fileName}`);
      }

      throw error;
    } finally {
      await handle?.close();
    }

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
    const mutationKey = `${input.scope}:${fileName}`;

    return this.withMutationQueue(mutationKey, async () => {
      return this.writeNoteInternal(input);
    });
  }

  public async appendToNote(input: AppendNoteInput): Promise<StoredNote> {
    const fileName = normalizeNoteName(input.name);
    const mutationKey = `append:${fileName}`;

    return this.withMutationQueue(mutationKey, async () => {
      const existing = await this.readNote(input.name, input.selection);

      if (existing === null) {
        throw new NotesError(`Cannot append. Note not found: ${input.name}`);
      }

      const separator = existing.markdown.endsWith("\n") ? "" : "\n";
      const nextMarkdown = `${existing.markdown}${separator}${input.text}\n`;

      return this.writeNoteInternal({
        name: existing.name,
        markdown: nextMarkdown,
        scope: existing.scope,
        updatedIso: input.updatedIso
      });
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

  public async removeScopeDirectory(scope: NotesScope): Promise<{ path: string; removed: boolean }> {
    const directoryPath = this.getNotesDirectory(scope);

    if (!(await this.pathExists(directoryPath))) {
      return {
        path: directoryPath,
        removed: false
      };
    }

    await rm(directoryPath, { recursive: true, force: true });
    return {
      path: directoryPath,
      removed: true
    };
  }

  public async moveNote(input: MoveNoteInput): Promise<MoveNoteResult> {
    const fileName = normalizeNoteName(input.name);
    const mutationKey = `move:${fileName}`;

    return this.withMutationQueue(mutationKey, async () => {
      const source = await this.readNote(input.name, input.selection);
      if (source === null) {
        throw new NotesError(`Note not found: ${input.name}`);
      }

      if (source.scope === input.destinationScope) {
        throw new NotesError(`Note already exists in ${input.destinationScope} scope: ${source.fileName}`);
      }

      await this.ensureScopeDirectory(input.destinationScope);
      const destinationPath = this.getNotePath(input.destinationScope, source.fileName);
      const destinationExists = await this.noteExists(input.destinationScope, source.fileName);

      if (destinationExists && !input.overwrite) {
        throw new NotesError(`Destination already has note: ${source.fileName}. Re-run with --overwrite.`);
      }

      if (input.overwrite) {
        await writeFile(destinationPath, source.markdown, "utf8");
      } else {
        let handle: FileHandle | undefined;
        try {
          handle = await open(destinationPath, "wx");
          await handle.writeFile(source.markdown, "utf8");
        } catch (error: unknown) {
          if (isAlreadyExists(error)) {
            throw new NotesError(`Destination already has note: ${source.fileName}. Re-run with --overwrite.`);
          }

          throw error;
        } finally {
          await handle?.close();
        }
      }

      await rm(source.path, { force: true });

      return {
        source,
        destination: {
          ...source,
          path: destinationPath,
          scope: input.destinationScope
        },
        overwrittenDestination: destinationExists
      };
    });
  }

  public async renameNote(input: RenameNoteInput): Promise<RenameNoteResult> {
    const sourceFileName = normalizeNoteName(input.fromName);
    const destinationFileName = normalizeNoteName(input.toName);
    const mutationKey = `rename:${sourceFileName}->${destinationFileName}`;

    return this.withMutationQueue(mutationKey, async () => {
      const source = await this.readNote(input.fromName, input.selection);
      if (source === null) {
        throw new NotesError(`Note not found: ${input.fromName}`);
      }

      if (source.fileName === destinationFileName) {
        throw new NotesError(`Rename target matches current name: ${source.fileName}`);
      }

      await this.ensureScopeDirectory(source.scope);

      const destinationPath = this.getNotePath(source.scope, destinationFileName);
      const destinationExists = await this.noteExists(source.scope, destinationFileName);

      if (destinationExists && !input.overwrite) {
        throw new NotesError(
          `Destination already has note: ${destinationFileName}. Re-run with --overwrite.`
        );
      }

      if (input.overwrite) {
        await writeFile(destinationPath, source.markdown, "utf8");
      } else {
        let handle: FileHandle | undefined;
        try {
          handle = await open(destinationPath, "wx");
          await handle.writeFile(source.markdown, "utf8");
        } catch (error: unknown) {
          if (isAlreadyExists(error)) {
            throw new NotesError(
              `Destination already has note: ${destinationFileName}. Re-run with --overwrite.`
            );
          }

          throw error;
        } finally {
          await handle?.close();
        }
      }

      await rm(source.path, { force: true });

      return {
        source,
        destination: {
          ...source,
          name: destinationFileName.slice(0, -3),
          fileName: destinationFileName,
          path: destinationPath
        },
        overwrittenDestination: destinationExists
      };
    });
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

  public async grepNotes(query: string, selection: ScopeSelection): Promise<readonly StoredNote[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      throw new NotesError("Search query cannot be empty.");
    }

    const notes = await this.listNotes(selection);
    return notes.filter((note) => {
      const haystack = `${note.fileName}\n${note.markdown}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  private async writeNoteInternal(input: WriteNoteInput): Promise<StoredNote> {
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

  private async withMutationQueue<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = NotesStorage.mutationQueues.get(key) ?? Promise.resolve();

    const run = previous.then(operation, operation);
    const queueTail = run.then(
      () => undefined,
      () => undefined
    );

    NotesStorage.mutationQueues.set(key, queueTail);

    try {
      return await run;
    } finally {
      if (NotesStorage.mutationQueues.get(key) === queueTail) {
        NotesStorage.mutationQueues.delete(key);
      }
    }
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

  private async pathExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return false;
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
