import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("package resource manifest", () => {
  it("declares package resources and current Pi peer imports", async () => {
    const packagePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
      pi?: { extensions?: string[]; skills?: string[] };
      files?: string[];
      peerDependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(packageJson.pi?.extensions).toContain("./extensions/pi-notes/index.ts");
    expect(packageJson.pi?.skills).toContain("./skills");
    expect(packageJson.files).toContain("extensions");
    expect(packageJson.files).toContain("skills");
    expect(packageJson.peerDependencies).toHaveProperty("@earendil-works/pi-coding-agent", "*");
    expect(packageJson.peerDependencies).not.toHaveProperty("@mariozechner/pi-coding-agent");
    expect(packageJson.devDependencies).toHaveProperty("typebox");
    expect(packageJson.devDependencies).not.toHaveProperty("@sinclair/typebox");
  });

  it("loads the package extension entry with runtime imports", async () => {
    const packageEntry = await import("../extensions/pi-notes/index.js");
    const sourceEntry = await import("../src/index.js");

    expect(packageEntry.default).toEqual(expect.any(Function));
    expect(packageEntry.default).toBe(sourceEntry.default);
    expect(sourceEntry.getNotesSetupToolName()).toBe("notes_setup");
  });

  it("ships pi-notes skill with tool-first routing guidance", async () => {
    const skillPath = join(process.cwd(), "skills", "pi-notes", "SKILL.md");
    const skill = await readFile(skillPath, "utf8");

    expect(skill).toContain("name: pi-notes");
    expect(skill).toContain("use registered `notes_*` tools");
    expect(skill).toContain("`notes_show` with `name: npm`, `scope: global`");
    expect(skill).toContain("Use: /notes rm npm --global");
    expect(skill).toContain("Never suggest `/pi-notes ...` as a slash command.");
  });

  it("documents tool-first behavior without exposing hidden aliases", async () => {
    const readme = await readFile(join(process.cwd(), "README.md"), "utf8");
    const commands = await readFile(join(process.cwd(), "docs", "commands.md"), "utf8");
    const architecture = await readFile(join(process.cwd(), "docs", "architecture.md"), "utf8");
    const docs = `${readme}\n${commands}\n${architecture}`;

    expect(docs).toContain("notes_*");
    expect(docs).toContain("pi.registerTool");
    expect(docs).toContain("tool-first");
    expect(docs).not.toContain("/notes add");
    expect(docs).not.toContain("/notes list");
  });
});
