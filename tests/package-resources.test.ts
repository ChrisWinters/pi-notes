import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("package resource manifest", () => {
  it("declares skills path in package.json pi manifest", async () => {
    const packagePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
      pi?: { skills?: string[] };
      files?: string[];
    };

    expect(packageJson.pi?.skills).toContain("./skills");
    expect(packageJson.files).toContain("skills");
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
