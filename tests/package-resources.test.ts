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

    expect(packageJson.pi?.extensions).toContain("./src/index.ts");
    expect(packageJson.pi?.skills).toContain("./skills");
    expect(packageJson.files).toContain("skills");
    expect(packageJson.peerDependencies).toHaveProperty("@earendil-works/pi-coding-agent", "*");
    expect(packageJson.peerDependencies).not.toHaveProperty("@mariozechner/pi-coding-agent");
    expect(packageJson.devDependencies).toHaveProperty("typebox");
    expect(packageJson.devDependencies).not.toHaveProperty("@sinclair/typebox");
  });

  it("loads the source extension entry with runtime imports", async () => {
    const extension = await import("../src/index.js");

    expect(extension.default).toEqual(expect.any(Function));
    expect(extension.getNotesSetupToolName()).toBe("notes_setup");
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
});
