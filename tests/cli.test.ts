import { access, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { isDirectCliEntry, runCli } from "../src/cli.js";

const roots: string[] = [];
const originalHome = process.env["HOME"];

async function createTempWorkspace(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-cli-test-"));
  roots.push(root);
  process.env["HOME"] = root;

  return join(root, "project");
}

interface CliResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

async function runCaptured(argv: readonly string[], cwd: string): Promise<CliResult> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const code = await runCli(argv, {
    cwd,
    interactive: false,
    onStdout: (message) => {
      stdout.push(message);
    },
    onStderr: (message) => {
      stderr.push(message);
    }
  });

  return {
    code,
    stdout: stdout.join("\n"),
    stderr: stderr.join("\n")
  };
}

function projectNotePath(cwd: string, name: string): string {
  return join(cwd, ".pi", "notes", `${name}.md`);
}

async function createProjectNote(cwd: string, name: string): Promise<string> {
  const result = await runCaptured(["new", name], cwd);
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  return projectNotePath(cwd, name);
}

afterEach(async () => {
  process.env["HOME"] = originalHome;

  while (roots.length > 0) {
    const root = roots.pop();
    if (root !== undefined) {
      await rm(root, { recursive: true, force: true });
    }
  }
});

describe("pi-notes CLI", () => {
  it("detects symlinked direct-entry paths", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-notes-cli-entry-test-"));
    roots.push(root);
    const target = join(root, "cli.js");
    const link = join(root, "pi-notes");

    await writeFile(target, "#!/usr/bin/env node\n", "utf8");
    await symlink(target, link);

    expect(isDirectCliEntry(pathToFileURL(target).href, link)).toBe(true);
    expect(isDirectCliEntry(pathToFileURL(target).href, target)).toBe(true);
    expect(isDirectCliEntry(pathToFileURL(target).href, undefined)).toBe(false);
    expect(isDirectCliEntry(pathToFileURL(target).href, resolve(root, "missing"))).toBe(false);
  });

  it.each([
    ["long", "--help"],
    ["short", "-h"]
  ])("shows usage with the %s help flag", async (_label, flag) => {
    const cwd = await createTempWorkspace();
    const result = await runCaptured([flag], cwd);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage:");
  });

  it.each([
    ["empty argv", []],
    ["help command", ["help"]],
    ["commands alias", ["commands"]]
  ])("shows usage for %s", async (_label, argv) => {
    const cwd = await createTempWorkspace();
    const result = await runCaptured(argv, cwd);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage:");
  });

  it("reports an unknown command through the CLI failure path", async () => {
    const cwd = await createTempWorkspace();
    const result = await runCaptured(["unknown-command"], cwd);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Unknown /notes subcommand: unknown-command");
  });

  it("supports deterministic show flow", async () => {
    const cwd = await createTempWorkspace();
    const stdout: string[] = [];
    const stderr: string[] = [];

    await runCli(["new", "npm", "--global"], {
      cwd,
      interactive: false,
      onStdout: (message) => {
        stdout.push(message);
      },
      onStderr: (message) => {
        stderr.push(message);
      }
    });

    const code = await runCli(["show", "npm", "--global"], {
      cwd,
      interactive: false,
      onStdout: (message) => {
        stdout.push(message);
      },
      onStderr: (message) => {
        stderr.push(message);
      }
    });

    expect(code).toBe(0);
    expect(stderr).toHaveLength(0);
    expect(stdout.join("\n")).toContain("[global] npm.md");
  });

  it("returns a nonzero status for a missing requested note", async () => {
    const cwd = await createTempWorkspace();
    const result = await runCaptured(["show", "missing", "--project"], cwd);

    expect(result.code).toBe(1);
    expect(result.stdout).toContain("Note not found: missing");
  });

  it("preserves a note when a destructive command has no force flag", async () => {
    const cwd = await createTempWorkspace();
    const notePath = await createProjectNote(cwd, "temp-delete");
    const before = await readFile(notePath, "utf8");

    const result = await runCaptured(["rm", "temp-delete"], cwd);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("requires an interactive UI session");
    expect(await readFile(notePath, "utf8")).toBe(before);
  });

  it.each([
    ["leading long", ["--yes", "rm", "temp-delete"]],
    ["leading short", ["-y", "rm", "temp-delete"]],
    ["trailing long", ["rm", "temp-delete", "--yes"]],
    ["trailing short", ["rm", "temp-delete", "-y"]],
    ["repeated leading", ["--yes", "-y", "--yes", "rm", "temp-delete"]],
    ["repeated trailing", ["rm", "temp-delete", "--yes", "-y", "--yes"]]
  ])("allows forced deletion with %s edge flags", async (_label, argv) => {
    const cwd = await createTempWorkspace();
    const notePath = await createProjectNote(cwd, "temp-delete");

    const result = await runCaptured(argv, cwd);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Deleted [project] temp-delete.md");
    await expect(access(notePath)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it.each([
    ["long", ["--yes", "--help", "rm", "temp-delete"]],
    ["short and repeated", ["-y", "--yes", "-h", "--help", "rm", "temp-delete"]]
  ])("shows help without mutation for %s mixed edge flags", async (_label, argv) => {
    const cwd = await createTempWorkspace();
    const notePath = await createProjectNote(cwd, "temp-delete");
    const before = await readFile(notePath, "utf8");

    const result = await runCaptured(argv, cwd);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).not.toContain("Deleted");
    expect(await readFile(notePath, "utf8")).toBe(before);
  });

  it("preserves interior flag-like tokens as command content", async () => {
    const cwd = await createTempWorkspace();
    const notePath = await createProjectNote(cwd, "literal-flags");

    const result = await runCaptured(
      ["append", "literal-flags", "keep", "--yes", "--mystery", "token"],
      cwd
    );

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(await readFile(notePath, "utf8")).toContain("keep --yes --mystery token");
  });
});
