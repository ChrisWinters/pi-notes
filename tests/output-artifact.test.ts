import { access, rm, stat, utimes } from "node:fs/promises";
import { dirname } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  OUTPUT_ARTIFACT_RETENTION_MS,
  persistFullToolOutput
} from "../src/core/output-artifact.js";

const artifactDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(artifactDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("full tool output artifacts", () => {
  it("creates owner-only files and directories", async () => {
    const path = await persistFullToolOutput("private note output");
    const directory = dirname(path);
    artifactDirectories.push(directory);

    if (process.platform !== "win32") {
      expect((await stat(path)).mode & 0o777).toBe(0o600);
      expect((await stat(directory)).mode & 0o777).toBe(0o700);
    }
  });

  it("deletes an artifact at its deadline while the host remains alive", async () => {
    const path = await persistFullToolOutput("short-lived", { retentionMs: 20 });
    await new Promise((resolve) => setTimeout(resolve, 50));

    await expect(access(path)).rejects.toThrow();
  });

  it("removes expired artifacts on a later artifact write", async () => {
    const expiredPath = await persistFullToolOutput("expired");
    const expiredDirectory = dirname(expiredPath);
    const expiredAt = new Date(Date.now() - OUTPUT_ARTIFACT_RETENTION_MS - 60_000);
    await utimes(expiredDirectory, expiredAt, expiredAt);

    const currentPath = await persistFullToolOutput("current");
    artifactDirectories.push(dirname(currentPath));

    await expect(access(expiredPath)).rejects.toThrow();
  });
});
