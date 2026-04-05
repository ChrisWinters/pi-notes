import { renderRewritePreview, renderScopeLabel } from "../../ui/render.js";
import { nowIso, requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleRewrite: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name, ...instructionParts] = args;
  if (name === undefined) {
    ctx.ui.notify("Missing note name for /notes rewrite.", "error");
    return;
  }

  const instruction = instructionParts.join(" ").trim();
  if (instruction.length === 0) {
    ctx.ui.notify("Missing rewrite instruction for /notes rewrite.", "error");
    return;
  }

  const target = await storage.readNote(name, scopeSelection);
  if (target === null) {
    ctx.ui.notify(`Note not found: ${name}`, "warning");
    return;
  }

  if (!requireHasUi(ctx)) {
    return;
  }

  const proposedMarkdown = await ctx.ui.editor(`Rewrite proposal for ${target.fileName}`, target.markdown);
  if (proposedMarkdown === undefined) {
    ctx.ui.notify("Rewrite cancelled.", "info");
    return;
  }

  ctx.ui.notify(renderRewritePreview(target.markdown, proposedMarkdown), "info");

  const confirmed = await ctx.ui.confirm(
    "Apply rewrite?",
    `Apply rewrite to ${renderScopeLabel(target.scope)} ${target.fileName}?`
  );

  if (!confirmed) {
    ctx.ui.notify("Rewrite cancelled.", "info");
    return;
  }

  const updated = await storage.writeNote({
    name: target.name,
    scope: target.scope,
    markdown: proposedMarkdown,
    updatedIso: nowIso()
  });

  ctx.ui.notify(`Rewrote ${renderScopeLabel(updated.scope)} ${updated.fileName} (instruction: ${instruction})`, "info");
};
