import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

export function handleNotesCommand(args: string, ctx: ExtensionCommandContext): void {
  const trimmedArgs = args.trim();

  if (trimmedArgs.length === 0) {
    ctx.ui.notify(
      "pi-notes scaffold is ready. Planned subcommands: ls, show, new, append, rm, grep, rewrite.",
      "info"
    );
    return;
  }

  ctx.ui.notify(`TODO: implement /notes ${trimmedArgs}`, "warning");
}
