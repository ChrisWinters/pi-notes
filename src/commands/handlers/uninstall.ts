import { renderScopeLabel } from "../../ui/render.js";
import { requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleUninstall: NotesHandler = async ({ scopeSelection, storage, ctx }) => {
  const removeProject = scopeSelection.forceProject || (!scopeSelection.forceProject && !scopeSelection.forceGlobal);
  const removeGlobal = scopeSelection.forceGlobal;

  const pending: { scope: "project" | "global"; path: string }[] = [];
  if (removeProject) {
    pending.push({ scope: "project", path: storage.getNotesDirectory("project") });
  }

  if (removeGlobal) {
    pending.push({ scope: "global", path: storage.getNotesDirectory("global") });
  }

  if (pending.length === 0) {
    ctx.ui.notify("No uninstall target selected.", "error");
    return;
  }

  if (!requireHasUi(ctx)) {
    return;
  }

  const summary = pending.map((item) => `- ${renderScopeLabel(item.scope)} ${item.path}`).join("\n");
  const confirmed = await ctx.ui.confirm(
    "Remove notes directories?",
    `This will delete notes data recursively:\n${summary}`
  );

  if (!confirmed) {
    ctx.ui.notify("Uninstall cancelled.", "info");
    return;
  }

  const results = await Promise.all(pending.map((item) => storage.removeScopeDirectory(item.scope)));
  const lines = ["Uninstall result:"];
  for (const [index, result] of results.entries()) {
    const scope = pending[index]?.scope ?? "project";
    lines.push(
      result.removed
        ? `- removed ${renderScopeLabel(scope)} ${result.path}`
        : `- already absent ${renderScopeLabel(scope)} ${result.path}`
    );
  }

  ctx.ui.notify(lines.join("\n"), "info");
};
