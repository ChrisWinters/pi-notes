import { describe, expect, it, vi } from "vitest";

import { handleNotesCommand } from "../src/commands/notes.js";

describe("handleNotesCommand", () => {
  it("shows scaffold info when no args are provided", () => {
    const notify = vi.fn();

    handleNotesCommand("", {
      ui: { notify }
    } as unknown as Parameters<typeof handleNotesCommand>[1]);

    expect(notify).toHaveBeenCalledTimes(1);
  });
});
