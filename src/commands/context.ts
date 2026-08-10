import type { MutationCoordinator } from "../core/mutation.js";

export type NotesNotifyLevel = "info" | "warning" | "error";
export type NotesCommandStatus = "success" | "failure" | "cancelled";

export interface NotesCommandOutcome {
  readonly status: NotesCommandStatus;
}

export interface NotesOutcomeSink {
  setStatus(status: Exclude<NotesCommandStatus, "success">): void;
}

export interface NotesCommandUi {
  notify(message: string, level: NotesNotifyLevel): void;
  confirm(title: string, message: string): Promise<boolean>;
  editor(title: string, prefilled: string): Promise<string | undefined>;
}

export interface NotesCommandContext {
  readonly cwd: string;
  readonly configDirName?: string;
  readonly mutationCoordinator?: MutationCoordinator;
  readonly signal?: AbortSignal | undefined;
  readonly outcomeSink?: NotesOutcomeSink;
  readonly hasUI: boolean;
  readonly ui: NotesCommandUi;
}

export function notifyFailure(
  ctx: NotesCommandContext,
  message: string,
  level: NotesNotifyLevel = "error"
): void {
  ctx.outcomeSink?.setStatus("failure");
  ctx.ui.notify(message, level);
}

export function notifyCancelled(ctx: NotesCommandContext, message: string): void {
  ctx.outcomeSink?.setStatus("cancelled");
  ctx.ui.notify(message, "info");
}
