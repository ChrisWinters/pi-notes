import { chmod, lstat, mkdtemp, open, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ARTIFACT_DIRECTORY_PREFIX = "pi-notes-output-";
const ARTIFACT_FILE_NAME = "full-output.txt";

/** Retain recoverable tool output for one day, then clean it on a later artifact write. */
export const OUTPUT_ARTIFACT_RETENTION_MS = 24 * 60 * 60 * 1_000;

async function cleanupExpiredArtifacts(now: number): Promise<void> {
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

export async function persistFullToolOutput(output: string): Promise<string> {
  const now = Date.now();
  await cleanupExpiredArtifacts(now);

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
    return path;
  } catch (error: unknown) {
    await rm(directory, { recursive: true, force: true }).catch(() => undefined);
    throw error;
  }
}
