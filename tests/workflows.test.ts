import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

async function readWorkflow(name: string): Promise<string> {
  return readFile(join(process.cwd(), ".github", "workflows", name), "utf8");
}

describe("automation contracts", () => {
  it("installs the lockfile graph consistently in CI", async () => {
    const ci = await readWorkflow("ci.yml");

    expect(ci).toContain("npm ci --no-audit --no-fund");
    expect(ci).not.toContain("npm install --no-audit --no-fund");
  });

  it("publishes only from an intentional release or protected manual route", async () => {
    const publish = await readWorkflow("publish.yml");

    expect(publish).toContain("release:\n    types: [published]");
    expect(publish).toContain("workflow_dispatch:");
    expect(publish).not.toContain("branches: [\"release\"]");
    expect(publish).toContain("github.ref == 'refs/heads/main'");
    expect(publish).toContain("ref: ${{ env.RELEASE_TAG }}");
  });

  it("checks tag/version agreement and preserves least-privilege provenance", async () => {
    const publish = await readWorkflow("publish.yml");

    expect(publish).toContain("tag.slice(1) !== version");
    expect(publish).toContain("contents: read");
    expect(publish).toContain("id-token: write");
    expect(publish).toContain("npm publish --provenance");
    expect(publish).not.toContain("NPM_TOKEN");
  });
});
