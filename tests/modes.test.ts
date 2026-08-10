import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const roots: string[] = [];
const piExecutable = resolve("node_modules/.bin/pi");
const extensionPath = resolve("extensions/pi-notes/index.ts");

async function runHeadlessMode(mode: "print" | "json"): Promise<{ stdout: string; stderr: string }> {
  const root = await mkdtemp(join(tmpdir(), "pi-notes-mode-test-"));
  roots.push(root);
  const args = ["--offline", "--approve", "-e", extensionPath];
  if (mode === "json") {
    args.push("--mode", "json");
  }
  args.push("-p", "/notes ls");

  return new Promise((resolveResult, reject) => {
    const child = spawn(piExecutable, args, {
      cwd: root,
      env: { ...process.env, HOME: root },
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) {
        resolveResult({ stdout, stderr });
      } else {
        reject(new Error(`Pi mode process exited ${String(code)}: ${stderr}`));
      }
    });
    child.stdin.end();
  });
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("headless extension command modes", () => {
  it("prints an observable unsupported handoff in print mode", async () => {
    const result = await runHeadlessMode("print");

    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("unsupported in print mode");
    expect(result.stderr).toContain("pi-notes ls");
  }, 30_000);

  it("preserves JSON protocol output and emits the handoff on stderr", async () => {
    const result = await runHeadlessMode("json");
    const firstEvent = JSON.parse(result.stdout.trim()) as { type?: string };

    expect(firstEvent.type).toBe("session");
    expect(result.stderr).toContain("unsupported in json mode");
    expect(result.stderr).toContain("pi-notes ls");
  }, 30_000);
});
