import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import { handleNotesCommand } from "./commands/notes.js";

export default function registerPiNotesExtension(pi: ExtensionAPI): void {
  pi.registerCommand("notes", {
    description: "Manage notes in project (.pi/notes) or global (~/.pi/notes) scope",
    handler: async (args, ctx) => {
      await handleNotesCommand(args, ctx);
    }
  });
}
