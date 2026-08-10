import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import { NotesError } from "../src/core/errors.js";
import { parseNoteMarkdown } from "../src/core/format.js";
import { NotesStorage, resolveScopePreference } from "../src/core/storage.js";

describe("resolveScopePreference", () => {
  it("returns default with no force flags", () => {
    expect(resolveScopePreference({ forceProject: false, forceGlobal: false })).toBe("default");
  });

  it("throws on conflicting scope flags", () => {
    expect(() => resolveScopePreference({ forceProject: true, forceGlobal: true })).toThrowError();
  });
});

describe("NotesStorage", () => {
  async function withStorage(run: (storage: NotesStorage) => Promise<void>): Promise<void> {
    const root = await mkdtemp(join(tmpdir(), "pi-notes-test-"));
    const cwd = join(root, "project");
    const globalNotesDir = join(root, "global", ".pi", "notes");
    const storage = new NotesStorage({ cwd, globalNotesDir });

    try {
      await run(storage);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }

  it("supports a validated custom config directory name", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-notes-config-test-"));
    try {
      const storage = new NotesStorage({ cwd: root, configDirName: ".custom-pi" });
      const created = await storage.createNote({ name: "custom", scope: "project" });
      expect(created.path).toBe(join(root, ".custom-pi", "notes", "custom.md"));
      expect(() => new NotesStorage({ cwd: root, configDirName: "../escape" })).toThrow(NotesError);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("creates and reads a project note by default", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "Project Ideas", scope: "project" });

      const loaded = await storage.readNote("Project Ideas", { forceProject: false, forceGlobal: false });
      expect(loaded).not.toBeNull();
      expect(loaded?.scope).toBe("project");
      expect(loaded?.fileName).toBe("project-ideas.md");
    });
  });

  it("falls back to global when project note does not exist", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "Context", scope: "global" });

      const loaded = await storage.readNote("Context", { forceProject: false, forceGlobal: false });
      expect(loaded?.scope).toBe("global");
    });
  });

  it("prefers project note when both scopes contain same note", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "Runbook", scope: "global", title: "Global Runbook" });
      const projectCreated = await storage.createNote({ name: "Runbook", scope: "project", title: "Project Runbook" });

      const loaded = await storage.readNote("Runbook", { forceProject: false, forceGlobal: false });
      expect(loaded?.scope).toBe("project");

      const parsed = parseNoteMarkdown(projectCreated.markdown);
      expect(parsed.frontmatter.title).toBe("Project Runbook");
    });
  });

  it("updates frontmatter timestamp on append mutation", async () => {
    await withStorage(async (storage) => {
      const created = await storage.createNote({ name: "Daily", scope: "project" });
      const before = parseNoteMarkdown(created.markdown).frontmatter.updated;

      const appended = await storage.appendToNote({
        name: "Daily",
        text: "- shipped T-003",
        selection: { forceProject: false, forceGlobal: false },
        updatedIso: "2026-04-05T20:00:00.000Z"
      });

      const parsed = parseNoteMarkdown(appended.markdown);
      expect(parsed.frontmatter.updated).toBe("2026-04-05T20:00:00.000Z");
      expect(parsed.frontmatter.updated).not.toBe(before);
      expect(parsed.body).toContain("- shipped T-003");
    });
  });

  it("lists merged notes with project precedence in default scope", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "Shared", scope: "global" });
      await storage.createNote({ name: "Shared", scope: "project" });
      await storage.createNote({ name: "Only Global", scope: "global" });
      await storage.createNote({ name: "Only Project", scope: "project" });

      const notes = await storage.listNotes({ forceProject: false, forceGlobal: false });
      const names = notes.map((note) => `${note.scope}:${note.fileName}`);

      expect(names).toContain("project:shared.md");
      expect(names).toContain("global:only-global.md");
      expect(names).toContain("project:only-project.md");
      expect(names.filter((name) => name.endsWith(":shared.md"))).toHaveLength(1);
    });
  });

  it("creates a note atomically under concurrent create attempts", async () => {
    await withStorage(async (storage) => {
      const results = await Promise.allSettled([
        storage.createNote({ name: "atomic", scope: "project" }),
        storage.createNote({ name: "atomic", scope: "project" })
      ]);

      const fulfilled = results.filter((result) => result.status === "fulfilled");
      const rejected = results.filter((result) => result.status === "rejected");

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      const reason = rejected[0];
      if (reason?.status === "rejected") {
        expect(reason.reason).toBeInstanceOf(NotesError);
      }

      const note = await storage.readNote("atomic", { forceProject: false, forceGlobal: false });
      expect(note).not.toBeNull();
    });
  });

  it("serializes concurrent appends to avoid lost updates", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "race-log", scope: "project" });

      await Promise.all([
        storage.appendToNote({
          name: "race-log",
          text: "entry-a",
          selection: { forceProject: false, forceGlobal: false },
          updatedIso: "2026-04-05T20:00:00.000Z"
        }),
        storage.appendToNote({
          name: "race-log",
          text: "entry-b",
          selection: { forceProject: false, forceGlobal: false },
          updatedIso: "2026-04-05T20:00:01.000Z"
        })
      ]);

      const note = await storage.readNote("race-log", { forceProject: false, forceGlobal: false });
      expect(note).not.toBeNull();

      const markdown = note?.markdown ?? "";
      expect(markdown).toContain("entry-a");
      expect(markdown).toContain("entry-b");
    });
  });

  it("keeps all entries under higher concurrent append volume", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "race-many", scope: "project" });

      const entries = Array.from({ length: 10 }, (_value, index) => `entry-${index}`);
      await Promise.all(
        entries.map((entry, index) => {
          return storage.appendToNote({
            name: "race-many",
            text: entry,
            selection: { forceProject: false, forceGlobal: false },
            updatedIso: `2026-04-05T20:00:${String(index).padStart(2, "0")}.000Z`
          });
        })
      );

      const note = await storage.readNote("race-many", { forceProject: false, forceGlobal: false });
      expect(note).not.toBeNull();

      const markdown = note?.markdown ?? "";
      for (const entry of entries) {
        expect(markdown).toContain(entry);
      }
    });
  });

  it("runs setup idempotently and does not overwrite starter note", async () => {
    await withStorage(async (storage) => {
      const initial = await storage.setupNotes({
        starterGlobalMarkdown: "---\ntitle: note\nupdated: 2026-04-05T00:00:00.000Z\n---\n# first\n"
      });
      const second = await storage.setupNotes({
        starterGlobalMarkdown: "---\ntitle: note\nupdated: 2026-04-05T01:00:00.000Z\n---\n# second\n"
      });

      expect(initial.createdProjectDirectory).toBe(true);
      expect(initial.createdGlobalDirectory).toBe(true);
      expect(initial.createdStarterGlobalNote).toBe(true);
      expect(second.createdStarterGlobalNote).toBe(false);

      const loaded = await storage.readNote("note", { forceProject: false, forceGlobal: true });
      expect(loaded?.markdown).toContain("# first");
      expect(loaded?.markdown).not.toContain("# second");
    });
  });

  it("moves notes across scopes and preserves markdown", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "handoff", scope: "project" });
      await storage.appendToNote({
        name: "handoff",
        text: "line-1",
        selection: { forceProject: true, forceGlobal: false },
        updatedIso: "2026-04-05T20:00:00.000Z"
      });

      const moved = await storage.moveNote({
        name: "handoff",
        selection: { forceProject: true, forceGlobal: false },
        destinationScope: "global",
        overwrite: false
      });

      expect(moved.source.scope).toBe("project");
      expect(moved.destination.scope).toBe("global");
      expect(moved.destination.markdown).toContain("line-1");

      const projectRead = await storage.readNote("handoff", { forceProject: true, forceGlobal: false });
      const globalRead = await storage.readNote("handoff", { forceProject: false, forceGlobal: true });
      expect(projectRead).toBeNull();
      expect(globalRead?.markdown).toContain("line-1");
    });
  });

  it("fails move when destination exists and preserves both notes", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "dupe", scope: "project", title: "Project Source" });
      await storage.createNote({ name: "dupe", scope: "global", title: "Global Destination" });

      await expect(
        storage.moveNote({
          name: "dupe",
          selection: { forceProject: true, forceGlobal: false },
          destinationScope: "global",
          overwrite: false
        })
      ).rejects.toThrowError("Destination already has note");

      const source = await storage.readNote("dupe", { forceProject: true, forceGlobal: false });
      const destination = await storage.readNote("dupe", { forceProject: false, forceGlobal: true });
      expect(source?.markdown).toContain("Project Source");
      expect(destination?.markdown).toContain("Global Destination");
    });
  });

  it("overwrites a move destination only after writing source markdown", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "replace", scope: "project", title: "Project Source" });
      await storage.createNote({ name: "replace", scope: "global", title: "Global Destination" });

      const moved = await storage.moveNote({
        name: "replace",
        selection: { forceProject: true, forceGlobal: false },
        destinationScope: "global",
        overwrite: true
      });

      expect(moved.overwrittenDestination).toBe(true);
      expect(moved.source.scope).toBe("project");
      expect(moved.destination.scope).toBe("global");
      expect(moved.destination.markdown).toContain("Project Source");
      expect(await storage.readNote("replace", { forceProject: true, forceGlobal: false })).toBeNull();
      const destination = await storage.readNote("replace", { forceProject: false, forceGlobal: true });
      expect(destination?.markdown).toContain("Project Source");
      expect(destination?.markdown).not.toContain("Global Destination");
    });
  });

  it("serializes concurrent append and move for the same note", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "move-race", scope: "project" });

      const [appendResult, moveResult] = await Promise.allSettled([
        storage.appendToNote({
          name: "move-race",
          text: "after-race",
          selection: { forceProject: false, forceGlobal: false },
          updatedIso: "2026-04-05T20:00:00.000Z"
        }),
        storage.moveNote({
          name: "move-race",
          selection: { forceProject: true, forceGlobal: false },
          destinationScope: "global",
          overwrite: false
        })
      ]);

      expect(appendResult.status).toBe("fulfilled");
      expect(moveResult.status).toBe("fulfilled");

      const projectRead = await storage.readNote("move-race", { forceProject: true, forceGlobal: false });
      const globalRead = await storage.readNote("move-race", { forceProject: false, forceGlobal: true });
      expect(projectRead).toBeNull();
      expect(globalRead?.markdown).toContain("after-race");
    });
  });

  it("renames a note within scope", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "old-name", scope: "project" });
      await storage.appendToNote({
        name: "old-name",
        text: "carry content",
        selection: { forceProject: true, forceGlobal: false },
        updatedIso: "2026-04-05T20:00:00.000Z"
      });

      const renamed = await storage.renameNote({
        fromName: "old-name",
        toName: "new-name",
        selection: { forceProject: true, forceGlobal: false },
        overwrite: false
      });

      expect(renamed.source.fileName).toBe("old-name.md");
      expect(renamed.destination.fileName).toBe("new-name.md");

      const oldRead = await storage.readNote("old-name", { forceProject: true, forceGlobal: false });
      const newRead = await storage.readNote("new-name", { forceProject: true, forceGlobal: false });

      expect(oldRead).toBeNull();
      expect(newRead?.markdown).toContain("carry content");
    });
  });

  it("fails rename when destination exists and preserves both notes", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "alpha", scope: "project", title: "Alpha Source" });
      await storage.createNote({ name: "beta", scope: "project", title: "Beta Destination" });

      await expect(
        storage.renameNote({
          fromName: "alpha",
          toName: "beta",
          selection: { forceProject: true, forceGlobal: false },
          overwrite: false
        })
      ).rejects.toThrowError("Destination already has note");

      const source = await storage.readNote("alpha", { forceProject: true, forceGlobal: false });
      const destination = await storage.readNote("beta", { forceProject: true, forceGlobal: false });
      expect(source?.markdown).toContain("Alpha Source");
      expect(destination?.markdown).toContain("Beta Destination");
    });
  });

  it("overwrites a rename destination and preserves result metadata", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "alpha", scope: "project", title: "Alpha Source" });
      await storage.createNote({ name: "beta", scope: "project", title: "Beta Destination" });

      const renamed = await storage.renameNote({
        fromName: "alpha",
        toName: "beta",
        selection: { forceProject: true, forceGlobal: false },
        overwrite: true
      });

      expect(renamed.overwrittenDestination).toBe(true);
      expect(renamed.source.fileName).toBe("alpha.md");
      expect(renamed.destination.fileName).toBe("beta.md");
      expect(renamed.destination.name).toBe("beta");
      expect(renamed.destination.markdown).toContain("Alpha Source");
      expect(await storage.readNote("alpha", { forceProject: true, forceGlobal: false })).toBeNull();
      const destination = await storage.readNote("beta", { forceProject: true, forceGlobal: false });
      expect(destination?.markdown).toContain("Alpha Source");
      expect(destination?.markdown).not.toContain("Beta Destination");
    });
  });

  it("serializes competing renames from the same source note", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "rename-race", scope: "project" });

      const results = await Promise.allSettled([
        storage.renameNote({
          fromName: "rename-race",
          toName: "rename-a",
          selection: { forceProject: true, forceGlobal: false },
          overwrite: false
        }),
        storage.renameNote({
          fromName: "rename-race",
          toName: "rename-b",
          selection: { forceProject: true, forceGlobal: false },
          overwrite: false
        })
      ]);

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);

      const original = await storage.readNote("rename-race", { forceProject: true, forceGlobal: false });
      const renamedA = await storage.readNote("rename-a", { forceProject: true, forceGlobal: false });
      const renamedB = await storage.readNote("rename-b", { forceProject: true, forceGlobal: false });
      expect(original).toBeNull();
      expect([renamedA, renamedB].filter((note) => note !== null)).toHaveLength(1);
    });
  });

  it("removes a scope directory recursively", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "cleanup", scope: "project" });

      const removed = await storage.removeScopeDirectory("project");
      expect(removed.removed).toBe(true);

      const notes = await storage.listNotes({ forceProject: true, forceGlobal: false });
      expect(notes).toHaveLength(0);
    });
  });

  it.each(["project", "global"] as const)("rejects a symlinked %s note without reading or mutating its target", async (scope) => {
    await withStorage(async (storage) => {
      await storage.ensureScopeDirectory(scope);
      const externalPath = join(dirname(storage.getNotesDirectory(scope)), `external-${scope}.md`);
      const original = "---\ntitle: external\nupdated: 2026-08-09T00:00:00.000Z\n---\nsecret\n";
      await writeFile(externalPath, original, "utf8");
      await symlink(externalPath, storage.getNotePath(scope, "linked.md"));
      const selection = { forceProject: scope === "project", forceGlobal: scope === "global" };

      await expect(storage.readNote("linked", selection)).rejects.toThrow("Remove the symlink");
      await expect(storage.appendToNote({
        name: "linked",
        text: "MUTATED",
        selection,
        updatedIso: "2026-08-09T01:00:00.000Z"
      })).rejects.toThrow("Remove the symlink");
      expect(await readFile(externalPath, "utf8")).toBe(original);
    });
  });

  it("rejects symlinked config and notes directories", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-notes-dir-link-test-"));
    try {
      const cwd = join(root, "project");
      const external = join(root, "external");
      await mkdir(cwd, { recursive: true });
      await mkdir(external, { recursive: true });
      await symlink(external, join(cwd, ".pi"));
      const configLinked = new NotesStorage({ cwd });
      await expect(configLinked.createNote({ name: "blocked", scope: "project" })).rejects.toThrow("Remove the symlink");

      await rm(join(cwd, ".pi"));
      await mkdir(join(cwd, ".pi"));
      await symlink(external, join(cwd, ".pi", "notes"));
      const notesLinked = new NotesStorage({ cwd });
      await expect(notesLinked.listNotes({ forceProject: true, forceGlobal: false })).rejects.toThrow("Remove the symlink");
      expect(await readFile(join(external, "blocked.md"), "utf8").catch(() => null)).toBeNull();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects symlink destinations for overwrite move and rename", async () => {
    await withStorage(async (storage) => {
      await storage.createNote({ name: "move-source", scope: "project", title: "Move Source" });
      await storage.createNote({ name: "rename-source", scope: "project", title: "Rename Source" });
      await storage.ensureScopeDirectory("global");
      const externalPath = join(dirname(storage.getNotesDirectory("global")), "external-destination.md");
      const original = "---\ntitle: external\nupdated: 2026-08-09T00:00:00.000Z\n---\nunchanged\n";
      await writeFile(externalPath, original, "utf8");
      await symlink(externalPath, storage.getNotePath("global", "move-source.md"));
      await symlink(externalPath, storage.getNotePath("project", "rename-target.md"));

      await expect(storage.moveNote({
        name: "move-source",
        selection: { forceProject: true, forceGlobal: false },
        destinationScope: "global",
        overwrite: true
      })).rejects.toThrow("Remove the symlink");
      await expect(storage.renameNote({
        fromName: "rename-source",
        toName: "rename-target",
        selection: { forceProject: true, forceGlobal: false },
        overwrite: true
      })).rejects.toThrow("Remove the symlink");

      expect(await readFile(externalPath, "utf8")).toBe(original);
      expect(await storage.readNote("move-source", { forceProject: true, forceGlobal: false })).not.toBeNull();
      expect(await storage.readNote("rename-source", { forceProject: true, forceGlobal: false })).not.toBeNull();
    });
  });

  it.each(["project", "global"] as const)("rejects internal symlink entries before uninstalling %s scope", async (scope) => {
    await withStorage(async (storage) => {
      const note = await storage.createNote({ name: "preserved", scope });
      const externalPath = join(dirname(storage.getNotesDirectory(scope)), `external-uninstall-${scope}.md`);
      const original = "external uninstall target";
      await writeFile(externalPath, original, "utf8");
      await symlink(externalPath, join(storage.getNotesDirectory(scope), "linked-entry"));

      await expect(storage.removeScopeDirectory(scope)).rejects.toThrow("Remove the symlink");
      expect(await readFile(externalPath, "utf8")).toBe(original);
      expect(await readFile(note.path, "utf8")).toBe(note.markdown);
    });
  });

  it("rejects symlink entries during setup and uninstall", async () => {
    await withStorage(async (storage) => {
      await storage.ensureScopeDirectory("global");
      const externalFile = join(dirname(storage.getNotesDirectory("global")), "starter-target.md");
      const original = "external starter";
      await writeFile(externalFile, original, "utf8");
      await symlink(externalFile, storage.getNotePath("global", "note.md"));
      await expect(storage.setupNotes({ starterGlobalMarkdown: "replacement" })).rejects.toThrow("Remove the symlink");
      expect(await readFile(externalFile, "utf8")).toBe(original);

      const projectNotes = storage.getNotesDirectory("project");
      const externalDirectory = join(dirname(projectNotes), "external-directory");
      await rm(projectNotes, { recursive: true, force: true });
      await mkdir(externalDirectory);
      await symlink(externalDirectory, projectNotes);
      await expect(storage.removeScopeDirectory("project")).rejects.toThrow("Remove the symlink");
      expect(await readFile(externalFile, "utf8")).toBe(original);
    });
  });
});
