import type { NotesScope } from "../../core/storage.js";
import { notifyCancelled, notifyFailure, type NotesCommandContext } from "../context.js";
import { renderScopeLabel } from "../../ui/render.js";
import { requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

function resolveDestinationScope(
  toProject: boolean,
  toGlobal: boolean,
  ctx: NotesCommandContext
): NotesScope | null {
  if (!toProject && !toGlobal) {
    notifyFailure(ctx, "Missing move destination. Use --to-project or --to-global.");
    return null;
  }

  if (toProject && toGlobal) {
    notifyFailure(ctx, "Move destination flags conflict: choose either --to-project or --to-global.");
    return null;
  }

  return toProject ? "project" : "global";
}

export const handleMove: NotesHandler = async ({ args, moveSelection, scopeSelection, storage, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    notifyFailure(ctx, "Missing note name for /notes move.");
    return;
  }

  const destinationScope = resolveDestinationScope(moveSelection.toProject, moveSelection.toGlobal, ctx);
  if (destinationScope === null) {
    return;
  }

  const source = await storage.readNote(name, scopeSelection);
  if (source === null) {
    notifyFailure(ctx, `Note not found: ${name}`, "warning");
    return;
  }

  if (source.scope === destinationScope) {
    notifyFailure(ctx, `Note already in ${renderScopeLabel(source.scope)} scope: ${source.fileName}`, "warning");
    return;
  }

  if (moveSelection.overwrite) {
    if (!requireHasUi(ctx)) {
      return;
    }

    const confirmed = await ctx.ui.confirm(
      "Overwrite destination note?",
      `Moving ${source.fileName} will overwrite destination ${renderScopeLabel(destinationScope)} if it exists.`
    );

    if (!confirmed) {
      notifyCancelled(ctx, "Move cancelled.");
      return;
    }
  }

  const moved = await storage.moveNote({
    name,
    selection: scopeSelection,
    destinationScope,
    overwrite: moveSelection.overwrite
  });

  const overwriteSuffix = moved.overwrittenDestination ? " (overwrote destination)" : "";
  ctx.ui.notify(
    `Moved ${renderScopeLabel(moved.source.scope)} ${moved.source.fileName} -> ${renderScopeLabel(moved.destination.scope)}${overwriteSuffix}`,
    "info"
  );
};
