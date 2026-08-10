import { renderRewritePreview, renderScopeLabel } from "../../ui/render.js";
import { notifyCancelled, notifyFailure } from "../context.js";
import { nowIso, requireHasUi } from "../shared.js";
import type { NotesHandler } from "./types.js";

export const handleRewrite: NotesHandler = async ({ args, storage, scopeSelection, ctx }) => {
  const [name, ...instructionParts] = args;
  if (name === undefined) {
    notifyFailure(ctx, "Missing note name for /notes rewrite.");
    return;
  }

  const instruction = instructionParts.join(" ").trim();
  if (instruction.length === 0) {
    notifyFailure(ctx, "Missing rewrite instruction for /notes rewrite.");
    return;
  }

  const target = await storage.readNote(name, scopeSelection);
  if (target === null) {
    notifyFailure(ctx, `Note not found: ${name}`, "warning");
    return;
  }

  if (!requireHasUi(ctx)) {
    return;
  }

  const proposedMarkdown = await ctx.ui.editor(`Rewrite proposal for ${target.fileName}`, target.markdown);
  if (proposedMarkdown === undefined) {
    notifyCancelled(ctx, "Rewrite cancelled.");
    return;
  }

  ctx.ui.notify(renderRewritePreview(target.markdown, proposedMarkdown), "info");

  const confirmed = await ctx.ui.confirm(
    "Apply rewrite?",
    `Apply rewrite to ${renderScopeLabel(target.scope)} ${target.fileName}?`
  );

  if (!confirmed) {
    notifyCancelled(ctx, "Rewrite cancelled.");
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
