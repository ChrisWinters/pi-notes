import type { NotesScope } from "../../core/storage.js";
import type { NotesCommandContext } from "../context.js";
import { renderScopeLabel } from "../../ui/render.js";
import { requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

function resolveDestinationScope(
  toProject: boolean,
  toGlobal: boolean,
  ctx: NotesCommandContext
): NotesScope | null {
  if (!toProject && !toGlobal) {
    ctx.ui.notify("Missing move destination. Use --to-project or --to-global.", "error");
    return null;
  }

  if (toProject && toGlobal) {
    ctx.ui.notify("Move destination flags conflict: choose either --to-project or --to-global.", "error");
    return null;
  }

  return toProject ? "project" : "global";
}

export const handleMove: NotesHandler = async ({ args, moveSelection, scopeSelection, storage, ctx }) => {
  const [name] = args;
  if (name === undefined) {
    ctx.ui.notify("Missing note name for /notes move.", "error");
    return;
  }

  const destinationScope = resolveDestinationScope(moveSelection.toProject, moveSelection.toGlobal, ctx);
  if (destinationScope === null) {
    return;
  }

  const source = await storage.readNote(name, scopeSelection);
  if (source === null) {
    ctx.ui.notify(`Note not found: ${name}`, "warning");
    return;
  }

  if (source.scope === destinationScope) {
    ctx.ui.notify(`Note already in ${renderScopeLabel(source.scope)} scope: ${source.fileName}`, "info");
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
      ctx.ui.notify("Move cancelled.", "info");
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
