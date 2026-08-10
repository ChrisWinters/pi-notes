import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("package resource manifest", () => {
  it("declares package resources and current Pi peer imports", async () => {
    const packagePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
      pi?: { extensions?: string[]; skills?: string[] };
      files?: string[];
      peerDependencies?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(packageJson.pi?.extensions).toContain("./extensions/pi-notes/index.ts");
    expect(packageJson.pi?.skills).toContain("./skills");
    expect(packageJson.files).toContain("extensions");
    expect(packageJson.files).toContain("skills");
    expect(packageJson.peerDependencies?.["@earendil-works/pi-coding-agent"]).toBe("*");
    expect(packageJson.peerDependencies?.["typebox"]).toBe("*");
    expect(packageJson.devDependencies?.["@earendil-works/pi-coding-agent"]).toBe("^0.84.1");
    expect(packageJson.devDependencies?.["typebox"]).toBe("1.3.7");
    expect(packageJson.peerDependencies).not.toHaveProperty("@mariozechner/pi-coding-agent");
    expect(packageJson.dependencies?.["typebox"]).toBeUndefined();
    expect(packageJson.dependencies?.["@sinclair/typebox"]).toBeUndefined();
  });

  it("keeps lockfile root metadata aligned with bundled-core peers", async () => {
    const lock = JSON.parse(await readFile(join(process.cwd(), "package-lock.json"), "utf8")) as {
      packages?: Record<string, {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        peerDependencies?: Record<string, string>;
      }>;
    };
    const root = lock.packages?.[""];

    expect(root?.peerDependencies).toMatchObject({
      "@earendil-works/pi-coding-agent": "*",
      typebox: "*"
    });
    expect(root?.devDependencies).toMatchObject({
      "@earendil-works/pi-coding-agent": "^0.84.1",
      typebox: "1.3.7"
    });
    expect(root?.dependencies?.["typebox"]).toBeUndefined();
  });

  it("includes required extension and CLI resources in the dry-run tarball", async () => {
    const { stdout } = await execFileAsync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const result = JSON.parse(stdout) as
      | Array<{ files: Array<{ path: string }> }>
      | Record<string, { files: Array<{ path: string }> }>;
    const packageInfo = Array.isArray(result) ? result[0] : Object.values(result)[0];
    const paths = packageInfo?.files.map((file) => file.path) ?? [];

    expect(paths).toContain("src/index.ts");
    expect(paths).toContain("extensions/pi-notes/index.ts");
    expect(paths).toContain("skills/pi-notes/SKILL.md");
    expect(paths).toContain("README.md");
    expect(paths).toContain("LICENSE");
    expect(paths).toContain("dist/src/cli.js");
    expect(paths).toContain("dist/src/core/storage.js");
    expect(paths.some((path) => path.includes("node_modules/@earendil-works/pi-coding-agent"))).toBe(false);
    expect(paths.some((path) => path.includes("node_modules/typebox"))).toBe(false);
  }, 30_000);

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

  it("documents remediated mode, storage, and concurrency boundaries", async () => {
    const commands = await readFile(join(process.cwd(), "docs", "commands.md"), "utf8");
    const storage = await readFile(join(process.cwd(), "docs", "storage.md"), "utf8");
    const security = await readFile(join(process.cwd(), "docs", "security.md"), "utf8");
    const docsIndex = await readFile(join(process.cwd(), "docs", "README.md"), "utf8");

    expect(commands).toContain("Pi print");
    expect(commands).toContain("pi-notes ...");
    expect(commands).toContain("2,000 lines or 50KB");
    expect(storage).toContain("CONFIG_DIR_NAME");
    expect(storage).toContain("Separate CLI processes are not serialized");
    expect(security).toContain("Symlink rejection");
    expect(security).toContain("Canonical containment");
    expect(docsIndex).not.toContain("docs/plans/");
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
