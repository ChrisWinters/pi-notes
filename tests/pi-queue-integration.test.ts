import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type * as PiCodingAgentModule from "@earendil-works/pi-coding-agent";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { afterEach, describe, expect, it, vi } from "vitest";

const sharedQueue = vi.hoisted(() => {
  const calls: string[] = [];
  const tails = new Map<string, Promise<void>>();
  const queue = async <T>(path: string, operation: () => Promise<T>): Promise<T> => {
    calls.push(path);
    const previous = tails.get(path) ?? Promise.resolve();
    const run = previous.then(operation, operation);
    const tail = run.then(() => undefined, () => undefined);
    tails.set(path, tail);
    try {
      return await run;
    } finally {
      if (tails.get(path) === tail) {
        tails.delete(path);
      }
    }
  };
  return { calls, queue };
});

vi.mock("@earendil-works/pi-coding-agent", async (importOriginal) => {
  const actual = await importOriginal<typeof PiCodingAgentModule>();
  return { ...actual, withFileMutationQueue: sharedQueue.queue };
});

import registerPiNotesExtension from "../src/index.js";

interface RegisteredTool {
  readonly name: string;
  readonly execute: (
    toolCallId: string,
    params: Record<string, unknown>,
    signal: AbortSignal | undefined,
    onUpdate: undefined,
    ctx: ExtensionContext
  ) => Promise<unknown>;
}

const roots: string[] = [];
const originalHome = process.env["HOME"];

afterEach(async () => {
  sharedQueue.calls.length = 0;
  process.env["HOME"] = originalHome;
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("Pi shared mutation queue integration", () => {
  it("makes extension append wait behind an independent Pi-style mutation on the same path", async () => {
    const root = await mkdtemp(join(tmpdir(), "pi-notes-pi-queue-test-"));
    roots.push(root);
    process.env["HOME"] = root;
    const cwd = join(root, "project");
    const tools = new Map<string, RegisteredTool>();
    const api = {
      registerCommand: () => undefined,
      registerTool: (tool: RegisteredTool) => tools.set(tool.name, tool)
    } as unknown as ExtensionAPI;
    registerPiNotesExtension(api);
    const context = { cwd, hasUI: false } as ExtensionContext;
    const newTool = tools.get("notes_new");
    const appendTool = tools.get("notes_append");
    expect(newTool).toBeDefined();
    expect(appendTool).toBeDefined();

    await newTool?.execute("new", { name: "shared", scope: "project" }, undefined, undefined, context);
    const notePath = join(cwd, ".pi", "notes", "shared.md");
    let releaseBlocker: (() => void) | undefined;
    let markEntered: (() => void) | undefined;
    const entered = new Promise<void>((resolve) => {
      markEntered = resolve;
    });
    const blocker = sharedQueue.queue(notePath, async () => {
      markEntered?.();
      await new Promise<void>((resolve) => {
        releaseBlocker = resolve;
      });
    });
    await entered;

    let settled = false;
    const append = appendTool?.execute(
      "append",
      { name: "shared", text: "after-independent-queue", scope: "project" },
      undefined,
      undefined,
      context
    ).finally(() => {
      settled = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(settled).toBe(false);

    releaseBlocker?.();
    await blocker;
    await append;
    expect(sharedQueue.calls.filter((path) => path === notePath)).toHaveLength(3);
    expect(await readFile(notePath, "utf8")).toContain("after-independent-queue");
  });
});
