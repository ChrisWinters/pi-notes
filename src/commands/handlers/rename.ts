import { renderScopeLabel } from "../../ui/render.js";
import { requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleRename: NotesHandler = async ({ args, moveSelection, scopeSelection, storage, ctx }) => {
  const [fromName, toName] = args;
  if (fromName === undefined || toName === undefined) {
    ctx.ui.notify("Usage: /notes rename <from> <to> [--project|--global] [--overwrite]", "error");
    return;
  }

  if (moveSelection.overwrite) {
    if (!requireHasUi(ctx)) {
      return;
    }

    const confirmed = await ctx.ui.confirm(
      "Overwrite destination note?",
      `Renaming ${fromName} to ${toName} will overwrite destination if it exists.`
    );

    if (!confirmed) {
      ctx.ui.notify("Rename cancelled.", "info");
      return;
    }
  }

  const renamed = await storage.renameNote({
    fromName,
    toName,
    selection: scopeSelection,
    overwrite: moveSelection.overwrite
  });

  const overwriteSuffix = renamed.overwrittenDestination ? " (overwrote destination)" : "";
  ctx.ui.notify(
    `Renamed ${renderScopeLabel(renamed.source.scope)} ${renamed.source.fileName} -> ${renamed.destination.fileName}${overwriteSuffix}`,
    "info"
  );
};
