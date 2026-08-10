import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createQueuedMutationCoordinator } from "../src/core/mutation.js";
import { NotesStorage } from "../src/core/storage.js";

const roots: string[] = [];

async function createRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-mutation-test-"));
  roots.push(root);
  return root;
}

afterEach(async () => {
  while (roots.length > 0) {
    const root = roots.pop();
    if (root !== undefined) {
      await rm(root, { recursive: true, force: true });
    }
  }
});

describe("mutation coordination", () => {
  it("acquires unique mutation paths in deterministic order", async () => {
    const acquired: string[] = [];
    const coordinator = createQueuedMutationCoordinator((path, operation) => {
      acquired.push(path);
      return operation();
    });

    await expect(coordinator.withMutations(["/z", "/a", "/z"], () => Promise.resolve("done"))).resolves.toBe("done");
    expect(acquired).toEqual(["/a", "/z"]);
  });

  it("wraps the complete append read-modify-write window", async () => {
    const root = await createRoot();
    const windows: Array<{ paths: readonly string[]; active: boolean }> = [];
    const coordinator = {
      async withMutations<T>(paths: readonly string[], operation: () => Promise<T>): Promise<T> {
        const window = { paths, active: true };
        windows.push(window);
        try {
          return await operation();
        } finally {
          window.active = false;
        }
      }
    };
    const storage = new NotesStorage({ cwd: join(root, "project"), mutationCoordinator: coordinator });

    await storage.createNote({ name: "coordinated", scope: "project" });
    await storage.appendToNote({
      name: "coordinated",
      text: "inside-window",
      selection: { forceProject: true, forceGlobal: false },
      updatedIso: "2026-08-09T00:00:00.000Z"
    });

    expect(windows).toHaveLength(2);
    expect(windows[1]?.paths).toEqual([storage.getNotePath("project", "coordinated.md")]);
    expect(windows.every((window) => window.active === false)).toBe(true);
    const note = await storage.readNote("coordinated", { forceProject: true, forceGlobal: false });
    expect(note?.markdown).toContain("inside-window");
  });

  it("locks both default-scope candidates before selecting a winner", async () => {
    const root = await createRoot();
    const cwd = join(root, "project");
    const globalNotesDir = join(root, "global", ".pi", "notes");
    const setupStorage = new NotesStorage({ cwd, globalNotesDir });
    await setupStorage.createNote({ name: "winner", scope: "global", title: "global" });
    await setupStorage.ensureScopeDirectory("project");

    let acquired: readonly string[] = [];
    const coordinator = {
      async withMutations<T>(paths: readonly string[], operation: () => Promise<T>): Promise<T> {
        acquired = [...paths];
        await writeFile(
          setupStorage.getNotePath("project", "winner.md"),
          "---\ntitle: project\nupdated: 2026-08-09T00:00:00.000Z\n---\n\n## project\n",
          "utf8"
        );
        return operation();
      }
    };
    const storage = new NotesStorage({ cwd, globalNotesDir, mutationCoordinator: coordinator });

    const updated = await storage.appendToNote({
      name: "winner",
      text: "selected-after-acquisition",
      selection: { forceProject: false, forceGlobal: false },
      updatedIso: "2026-08-09T00:00:01.000Z"
    });

    expect(new Set(acquired)).toEqual(new Set([
      storage.getNotePath("project", "winner.md"),
      storage.getNotePath("global", "winner.md")
    ]));
    expect(updated.scope).toBe("project");
    expect(updated.markdown).toContain("selected-after-acquisition");
    const global = await setupStorage.readNote("winner", { forceProject: false, forceGlobal: true });
    expect(global?.markdown).not.toContain("selected-after-acquisition");
  });

  it("does not mutate when aborted while waiting for the shared queue", async () => {
    const root = await createRoot();
    const controller = new AbortController();
    let releaseQueue: (() => void) | undefined;
    const queueGate = new Promise<void>((resolve) => {
      releaseQueue = resolve;
    });
    const coordinator = createQueuedMutationCoordinator(async (_path, operation) => {
      await queueGate;
      return operation();
    });
    const cwd = join(root, "project");
    const storage = new NotesStorage({ cwd, mutationCoordinator: coordinator, signal: controller.signal });

    const creation = storage.createNote({ name: "cancelled", scope: "project" });
    controller.abort();
    releaseQueue?.();

    await expect(creation).rejects.toThrow("Notes operation cancelled");
    const verifier = new NotesStorage({ cwd });
    await expect(verifier.readNote("cancelled", { forceProject: true, forceGlobal: false })).resolves.toBeNull();
  });
});
