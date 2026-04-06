import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../src/cli.js";

const roots: string[] = [];
const originalHome = process.env["HOME"];

async function createTempWorkspace(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-cli-test-"));
  roots.push(root);
  process.env["HOME"] = root;

  return join(root, "project");
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
  it("shows usage with help", async () => {
    const cwd = await createTempWorkspace();
    const stdout: string[] = [];
    const stderr: string[] = [];

    const code = await runCli(["--help"], {
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
    expect(stdout.join("\n")).toContain("Usage:");
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

  it("requires UI for destructive commands without --yes in non-interactive mode", async () => {
    const cwd = await createTempWorkspace();
    const stdout: string[] = [];
    const stderr: string[] = [];

    await runCli(["new", "temp-delete"], {
      cwd,
      interactive: false,
      onStdout: (message) => {
        stdout.push(message);
      },
      onStderr: (message) => {
        stderr.push(message);
      }
    });

    const code = await runCli(["rm", "temp-delete"], {
      cwd,
      interactive: false,
      onStdout: (message) => {
        stdout.push(message);
      },
      onStderr: (message) => {
        stderr.push(message);
      }
    });

    expect(code).toBe(1);
    expect(stderr.join("\n")).toContain("requires an interactive UI session");
  });

  it("allows destructive command with --yes in non-interactive mode", async () => {
    const cwd = await createTempWorkspace();
    const stdout: string[] = [];
    const stderr: string[] = [];

    await runCli(["new", "temp-delete"], {
      cwd,
      interactive: false,
      onStdout: (message) => {
        stdout.push(message);
      },
      onStderr: (message) => {
        stderr.push(message);
      }
    });

    const code = await runCli(["rm", "temp-delete", "--yes"], {
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
    expect(stdout.join("\n")).toContain("Deleted [project] temp-delete.md");
  });
});
