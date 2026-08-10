import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, realpath, rm } from "node:fs/promises";
import type { Stats } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { homedir } from "node:os";

import { NotesError } from "./errors.js";
import { createEmptyNoteMarkdown, parseNoteMarkdown, withUpdatedTimestamp } from "./format.js";
import { localMutationCoordinator, throwIfNotesAborted, type MutationCoordinator } from "./mutation.js";
import { assertSafeNoteFileName, normalizeNoteName } from "./naming.js";

export type NotesScope = "project" | "global";

export interface ScopeSelection {
  readonly forceProject: boolean;
  readonly forceGlobal: boolean;
}

export interface NotesStorageOptions {
  readonly cwd: string;
  readonly configDirName?: string;
  readonly globalNotesDir?: string;
  readonly mutationCoordinator?: MutationCoordinator;
  readonly signal?: AbortSignal;
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

function assertSafeConfigDirName(configDirName: string): void {
  if (
    configDirName.length === 0
    || configDirName === "."
    || configDirName === ".."
    || isAbsolute(configDirName)
    || configDirName.includes("/")
    || configDirName.includes("\\")
  ) {
    throw new NotesError(`Invalid notes config directory name: ${configDirName}`);
  }
}

function isContainedPath(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate);
  return pathFromRoot === "" || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== ".." && !isAbsolute(pathFromRoot));
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
  private readonly configDirName: string;
  private readonly globalNotesDir: string;
  private readonly mutationCoordinator: MutationCoordinator;
  private readonly signal: AbortSignal | undefined;

  public constructor(options: NotesStorageOptions) {
    this.cwd = resolve(options.cwd);
    this.configDirName = options.configDirName ?? ".pi";
    assertSafeConfigDirName(this.configDirName);
    this.globalNotesDir = resolve(options.globalNotesDir ?? join(homedir(), this.configDirName, "notes"));
    this.mutationCoordinator = options.mutationCoordinator ?? localMutationCoordinator;
    this.signal = options.signal;
  }

  public getNotesDirectory(scope: NotesScope): string {
    if (scope === "project") {
      return join(this.cwd, this.configDirName, "notes");
    }

    return this.globalNotesDir;
  }

  public getNotePath(scope: NotesScope, fileName: string): string {
    assertSafeNoteFileName(fileName);
    return join(this.getNotesDirectory(scope), fileName);
  }

  public async ensureScopeDirectory(scope: NotesScope): Promise<string> {
    this.assertNotAborted();
    const directory = this.getNotesDirectory(scope);
    const configDirectory = dirname(directory);

    // The caller owns the base path (project root or home override). Only the
    // config and notes components are pi-notes trust boundaries.
    await mkdir(dirname(configDirectory), { recursive: true });
    this.assertNotAborted();
    await this.ensureRegularDirectory(configDirectory, scope);
    this.assertNotAborted();
    await this.ensureRegularDirectory(directory, scope);
    await this.assertCanonicalDirectoryContainment(scope);
    return directory;
  }

  public async setupNotes(input: SetupNotesInput): Promise<SetupNotesResult> {
    const starterGlobalNotePath = this.getNotePath("global", normalizeNoteName("note"));
    return this.withMutationQueues(
      [this.getNotesDirectory("project"), this.getNotesDirectory("global"), starterGlobalNotePath],
      () => this.setupNotesInternal(input)
    );
  }

  private async setupNotesInternal(input: SetupNotesInput): Promise<SetupNotesResult> {
    this.assertNotAborted();
    const projectDirectoryPath = this.getNotesDirectory("project");
    const globalDirectoryPath = this.getNotesDirectory("global");
    const starterFileName = normalizeNoteName("note");
    const starterGlobalNotePath = this.getNotePath("global", starterFileName);

    const createdProjectDirectory = !(await this.scopeDirectoryExists("project"));
    await this.ensureScopeDirectory("project");
    this.assertNotAborted();

    const createdGlobalDirectory = !(await this.scopeDirectoryExists("global"));
    await this.ensureScopeDirectory("global");
    this.assertNotAborted();

    let createdStarterGlobalNote = false;
    let handle: FileHandle | undefined;
    try {
      handle = await open(starterGlobalNotePath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
      await handle.writeFile(input.starterGlobalMarkdown, "utf8");
      createdStarterGlobalNote = true;
    } catch (error: unknown) {
      if (!isAlreadyExists(error)) {
        throw error;
      }
      await this.assertRegularNoteEntry("global", starterFileName);
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
    this.assertNotAborted();
    assertSafeNoteFileName(fileName);
    if (!(await this.scopeDirectoryExists(scope))) {
      return false;
    }
    return (await this.assertRegularNoteEntry(scope, fileName)) !== null;
  }

  public async createNote(input: CreateNoteInput): Promise<StoredNote> {
    this.assertNotAborted();
    const fileName = normalizeNoteName(input.name);
    const targetPath = this.getNotePath(input.scope, fileName);

    return this.withMutationQueue(targetPath, async () => {
      await this.ensureScopeDirectory(input.scope);
      const existing = await this.assertRegularNoteEntry(input.scope, fileName);
      if (existing !== null) {
        throw new NotesError(`Note already exists: ${fileName}`);
      }

      const nowIso = new Date().toISOString();
      const title = input.title?.trim().length ? input.title : input.name.trim();
      const markdown = createEmptyNoteMarkdown(title, nowIso);
      this.assertNotAborted();

      let handle: FileHandle | undefined;
      try {
        handle = await open(targetPath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
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
    });
  }

  public async readNoteByFileName(fileName: string, selection: ScopeSelection): Promise<StoredNote | null> {
    this.assertNotAborted();
    assertSafeNoteFileName(fileName);
    const scopePreference = resolveScopePreference(selection);

    if (scopePreference === "project" || scopePreference === "global") {
      return this.readFromScope(scopePreference, fileName);
    }

    const projectMatch = await this.readFromScope("project", fileName);
    this.assertNotAborted();
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
    this.assertNotAborted();
    const fileName = normalizeNoteName(input.name);
    const targetPath = this.getNotePath(input.scope, fileName);

    return this.withMutationQueue(targetPath, async () => {
      return this.writeNoteInternal(input);
    });
  }

  public async appendToNote(input: AppendNoteInput): Promise<StoredNote> {
    this.assertNotAborted();
    const candidatePaths = this.getCandidateNotePaths(input.name, input.selection);

    return this.withMutationQueues(candidatePaths, async () => {
      const existing = await this.readNote(input.name, input.selection);

      if (existing === null) {
        throw new NotesError(`Cannot append. Note not found: ${input.name}`);
      }

      const separator = existing.markdown.endsWith("\n") ? "" : "\n";
      const nextMarkdown = `${existing.markdown}${separator}${input.text}\n`;
      this.assertNotAborted();

      return this.writeNoteInternal({
        name: existing.name,
        markdown: nextMarkdown,
        scope: existing.scope,
        updatedIso: input.updatedIso
      });
    });
  }

  public async deleteNote(name: string, selection: ScopeSelection): Promise<boolean> {
    this.assertNotAborted();
    const candidatePaths = this.getCandidateNotePaths(name, selection);

    return this.withMutationQueues(candidatePaths, async () => {
      const existing = await this.readNote(name, selection);

      if (existing === null) {
        return false;
      }

      this.assertNotAborted();
      await rm(existing.path);
      return true;
    });
  }

  public async removeScopeDirectory(scope: NotesScope): Promise<{ path: string; removed: boolean }> {
    const directoryPath = this.getNotesDirectory(scope);
    return this.withMutationQueue(directoryPath, async () => {
      this.assertNotAborted();
      if (!(await this.scopeDirectoryExists(scope))) {
        return {
          path: directoryPath,
          removed: false
        };
      }

      await this.assertCanonicalDirectoryContainment(scope);
      await this.assertSafeUninstallTree(directoryPath, scope);
      this.assertNotAborted();
      await rm(directoryPath, { recursive: true, force: true });
      return {
        path: directoryPath,
        removed: true
      };
    });
  }

  public async moveNote(input: MoveNoteInput): Promise<MoveNoteResult> {
    this.assertNotAborted();
    const fileName = normalizeNoteName(input.name);
    const candidatePaths = [
      ...this.getCandidateNotePaths(input.name, input.selection),
      this.getNotePath(input.destinationScope, fileName)
    ];

    return this.withMutationQueues(candidatePaths, async () => {
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

      // Move is consistency-critical after this boundary: complete destination
      // write and source removal before observing a later cancellation.
      this.assertNotAborted();
      await this.writeDestination(destinationPath, source.markdown, input.overwrite, source.fileName);

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
    this.assertNotAborted();
    const destinationFileName = normalizeNoteName(input.toName);
    const candidateScopes = this.getCandidateScopes(input.selection);
    const candidatePaths = candidateScopes.flatMap((scope) => [
      this.getNotePath(scope, normalizeNoteName(input.fromName)),
      this.getNotePath(scope, destinationFileName)
    ]);

    return this.withMutationQueues(candidatePaths, async () => {
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

      // Rename is consistency-critical after this boundary.
      this.assertNotAborted();
      await this.writeDestination(destinationPath, source.markdown, input.overwrite, destinationFileName);

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
    this.assertNotAborted();
    const scopePreference = resolveScopePreference(selection);

    if (scopePreference === "project" || scopePreference === "global") {
      return this.listFromScope(scopePreference);
    }

    const [projectNotes, globalNotes] = await Promise.all([
      this.listFromScope("project"),
      this.listFromScope("global")
    ]);

    this.assertNotAborted();
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
    this.assertNotAborted();
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      throw new NotesError("Search query cannot be empty.");
    }

    const notes = await this.listNotes(selection);
    return notes.filter((note) => {
      this.assertNotAborted();
      const haystack = `${note.fileName}\n${note.markdown}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }

  private async writeDestination(
    destinationPath: string,
    markdown: string,
    overwrite: boolean,
    destinationFileName: string
  ): Promise<void> {
    if (overwrite) {
      const destinationFileNameFromPath = destinationPath.slice(destinationPath.lastIndexOf(sep) + 1);
      const scope: NotesScope = dirname(destinationPath) === this.getNotesDirectory("project")
        ? "project"
        : "global";
      await this.assertRegularNoteEntry(scope, destinationFileNameFromPath);
      await this.writeFileNoFollow(destinationPath, markdown, false);
      return;
    }

    let handle: FileHandle | undefined;
    try {
      handle = await open(destinationPath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
      await handle.writeFile(markdown, "utf8");
    } catch (error: unknown) {
      if (isAlreadyExists(error)) {
        throw new NotesError(`Destination already has note: ${destinationFileName}. Re-run with --overwrite.`);
      }

      throw error;
    } finally {
      await handle?.close();
    }
  }

  private async writeNoteInternal(input: WriteNoteInput): Promise<StoredNote> {
    this.assertNotAborted();
    const fileName = normalizeNoteName(input.name);
    const targetPath = this.getNotePath(input.scope, fileName);

    await this.ensureScopeDirectory(input.scope);

    const updatedMarkdown = withUpdatedTimestamp(input.markdown, input.updatedIso);
    const existing = await this.assertRegularNoteEntry(input.scope, fileName);
    this.assertNotAborted();
    await this.writeFileNoFollow(targetPath, updatedMarkdown, existing === null);

    return {
      name: fileName.slice(0, -3),
      fileName,
      path: targetPath,
      scope: input.scope,
      markdown: updatedMarkdown
    };
  }

  private getCandidateScopes(selection: ScopeSelection): readonly NotesScope[] {
    const preference = resolveScopePreference(selection);
    return preference === "default" ? ["project", "global"] : [preference];
  }

  private getCandidateNotePaths(name: string, selection: ScopeSelection): readonly string[] {
    const fileName = normalizeNoteName(name);
    return this.getCandidateScopes(selection).map((scope) => this.getNotePath(scope, fileName));
  }

  private async withMutationQueue<T>(key: string, operation: () => Promise<T>): Promise<T> {
    return this.withMutationQueues([key], operation);
  }

  private async withMutationQueues<T>(keys: readonly string[], operation: () => Promise<T>): Promise<T> {
    return this.mutationCoordinator.withMutations(keys, operation, this.signal);
  }

  private async readFromScope(scope: NotesScope, fileName: string): Promise<StoredNote | null> {
    assertSafeNoteFileName(fileName);
    if (!(await this.scopeDirectoryExists(scope))) {
      return null;
    }

    const path = this.getNotePath(scope, fileName);
    if ((await this.assertRegularNoteEntry(scope, fileName)) === null) {
      return null;
    }

    let handle: FileHandle | undefined;
    try {
      handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      const markdown = await handle.readFile("utf8");
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
    } finally {
      await handle?.close();
    }
  }

  private async listFromScope(scope: NotesScope): Promise<readonly StoredNote[]> {
    if (!(await this.scopeDirectoryExists(scope))) {
      return [];
    }

    const directory = this.getNotesDirectory(scope);
    const files = await readdir(directory);
    const notes: StoredNote[] = [];
    for (const file of files) {
      this.assertNotAborted();
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

  private async scopeDirectoryExists(scope: NotesScope): Promise<boolean> {
    const configDirectory = dirname(this.getNotesDirectory(scope));
    const configStats = await this.lstatOrNull(configDirectory);
    if (configStats === null) {
      return false;
    }
    this.assertRegularDirectoryStats(configStats, configDirectory, scope);

    const directory = this.getNotesDirectory(scope);
    const notesStats = await this.lstatOrNull(directory);
    if (notesStats === null) {
      return false;
    }
    this.assertRegularDirectoryStats(notesStats, directory, scope);
    await this.assertCanonicalDirectoryContainment(scope);
    return true;
  }

  private async ensureRegularDirectory(path: string, scope: NotesScope): Promise<void> {
    const existing = await this.lstatOrNull(path);
    if (existing !== null) {
      this.assertRegularDirectoryStats(existing, path, scope);
      return;
    }

    try {
      await mkdir(path, { mode: 0o700 });
    } catch (error: unknown) {
      if (!isAlreadyExists(error)) {
        throw error;
      }
    }

    const created = await this.lstatOrNull(path);
    if (created === null) {
      throw new NotesError(`Unsafe ${scope} notes path disappeared during setup: ${path}`);
    }
    this.assertRegularDirectoryStats(created, path, scope);
  }

  private assertRegularDirectoryStats(stats: Stats, path: string, scope: NotesScope): void {
    if (stats.isSymbolicLink() || !stats.isDirectory()) {
      throw new NotesError(`Unsafe ${scope} notes directory: ${path}. Remove the symlink or non-directory entry.`);
    }
  }

  private async assertCanonicalDirectoryContainment(scope: NotesScope): Promise<void> {
    const configDirectory = dirname(this.getNotesDirectory(scope));
    const [canonicalConfig, canonicalNotes] = await Promise.all([
      realpath(configDirectory),
      realpath(this.getNotesDirectory(scope))
    ]);
    if (!isContainedPath(canonicalConfig, canonicalNotes)) {
      throw new NotesError(`Unsafe ${scope} notes directory escapes its config directory: ${this.getNotesDirectory(scope)}`);
    }
  }

  private async assertSafeUninstallTree(directory: string, scope: NotesScope): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      this.assertNotAborted();
      const path = join(directory, entry.name);
      const stats = await lstat(path);
      if (stats.isSymbolicLink()) {
        throw new NotesError(`Unsafe ${scope} notes entry during uninstall: ${path}. Remove the symlink.`);
      }
      if (stats.isDirectory()) {
        await this.assertSafeUninstallTree(path, scope);
      } else if (!stats.isFile()) {
        throw new NotesError(`Unsafe ${scope} notes entry during uninstall: ${path}. Remove the non-file entry.`);
      }
    }
  }

  private async assertRegularNoteEntry(scope: NotesScope, fileName: string): Promise<Stats | null> {
    assertSafeNoteFileName(fileName);
    await this.assertCanonicalDirectoryContainment(scope);
    const notesRoot = await realpath(this.getNotesDirectory(scope));
    const path = this.getNotePath(scope, fileName);
    const canonicalCandidate = resolve(notesRoot, fileName);
    if (!isContainedPath(notesRoot, canonicalCandidate)) {
      throw new NotesError(`Unsafe ${scope} note path escapes notes storage: ${path}`);
    }

    const stats = await this.lstatOrNull(path);
    if (stats === null) {
      return null;
    }
    if (stats.isSymbolicLink() || !stats.isFile()) {
      throw new NotesError(`Unsafe ${scope} note entry: ${path}. Remove the symlink or non-file entry.`);
    }
    return stats;
  }

  private async writeFileNoFollow(path: string, content: string, create: boolean): Promise<void> {
    let handle: FileHandle | undefined;
    try {
      const flags = create
        ? constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW
        : constants.O_WRONLY | constants.O_TRUNC | constants.O_NOFOLLOW;
      handle = await open(path, flags, 0o600);
      await handle.writeFile(content, "utf8");
    } finally {
      await handle?.close();
    }
  }

  private assertNotAborted(): void {
    throwIfNotesAborted(this.signal);
  }

  private async lstatOrNull(path: string): Promise<Stats | null> {
    try {
      return await lstat(path);
    } catch (error: unknown) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }
}
