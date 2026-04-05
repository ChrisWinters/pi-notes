import { nowIso, renderSetupStarterNote } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleSetup: NotesHandler = async ({ storage, ctx }) => {
  const result = await storage.setupNotes({
    starterGlobalMarkdown: renderSetupStarterNote(nowIso())
  });

  const lines = ["Notes setup complete:"];
  lines.push(
    result.createdProjectDirectory
      ? `- created project dir: ${result.projectDirectoryPath}`
      : `- project dir already exists: ${result.projectDirectoryPath}`
  );
  lines.push(
    result.createdGlobalDirectory
      ? `- created global dir: ${result.globalDirectoryPath}`
      : `- global dir already exists: ${result.globalDirectoryPath}`
  );
  lines.push(
    result.createdStarterGlobalNote
      ? `- created starter note: ${result.starterGlobalNotePath}`
      : `- starter note already exists: ${result.starterGlobalNotePath}`
  );
  lines.push("Run /notes show note --global");

  ctx.ui.notify(lines.join("\n"), "info");
};
