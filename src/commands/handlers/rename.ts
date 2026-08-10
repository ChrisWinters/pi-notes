import { renderScopeLabel } from "../../ui/render.js";
import { notifyCancelled, notifyFailure } from "../context.js";
import { requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleRename: NotesHandler = async ({ args, moveSelection, scopeSelection, storage, ctx }) => {
  const [fromName, toName] = args;
  if (fromName === undefined || toName === undefined) {
    notifyFailure(ctx, "Usage: /notes rename <from> <to> [--project|--global] [--overwrite]");
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
      notifyCancelled(ctx, "Rename cancelled.");
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
