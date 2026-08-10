import { chmod, lstat, mkdtemp, open, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ARTIFACT_DIRECTORY_PREFIX = "pi-notes-output-";
const ARTIFACT_FILE_NAME = "full-output.txt";

/** Retain recoverable tool output for one day, then clean it on a later artifact write. */
export const OUTPUT_ARTIFACT_RETENTION_MS = 24 * 60 * 60 * 1_000;

export async function cleanupExpiredToolOutputArtifacts(now = Date.now()): Promise<void> {
  let entries;
  try {
    entries = await readdir(tmpdir(), { withFileTypes: true });
  } catch {
    return;
  }

  await Promise.all(entries.map(async (entry) => {
    if (!entry.isDirectory() || !entry.name.startsWith(ARTIFACT_DIRECTORY_PREFIX)) {
      return;
    }

    const directory = join(tmpdir(), entry.name);
    try {
      const stats = await lstat(directory);
      if (!stats.isSymbolicLink() && now - stats.mtimeMs > OUTPUT_ARTIFACT_RETENTION_MS) {
        await rm(directory, { recursive: true, force: true });
      }
    } catch {
      // Cleanup is best-effort and must not make a new artifact unrecoverable.
    }
  }));
}

export interface PersistFullToolOutputOptions {
  readonly retentionMs?: number;
}

function scheduleArtifactCleanup(directory: string, retentionMs: number): void {
  const timer = setTimeout(() => {
    void rm(directory, { recursive: true, force: true }).catch(() => undefined);
  }, retentionMs);
  timer.unref();
}

export async function persistFullToolOutput(
  output: string,
  options: PersistFullToolOutputOptions = {}
): Promise<string> {
  const now = Date.now();
  const retentionMs = options.retentionMs ?? OUTPUT_ARTIFACT_RETENTION_MS;
  await cleanupExpiredToolOutputArtifacts(now);

  const directory = await mkdtemp(join(tmpdir(), ARTIFACT_DIRECTORY_PREFIX));
  const path = join(directory, ARTIFACT_FILE_NAME);

  try {
    const handle = await open(path, "wx", 0o600);
    try {
      await handle.writeFile(output, "utf8");
    } finally {
      await handle.close();
    }
    await chmod(path, 0o600);
    scheduleArtifactCleanup(directory, retentionMs);
    return path;
  } catch (error: unknown) {
    await rm(directory, { recursive: true, force: true }).catch(() => undefined);
    throw error;
  }
}
