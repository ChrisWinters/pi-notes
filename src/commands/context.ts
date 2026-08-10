export type NotesNotifyLevel = "info" | "warning" | "error";

export interface NotesCommandUi {
  notify(message: string, level: NotesNotifyLevel): void;
  confirm(title: string, message: string): Promise<boolean>;
  editor(title: string, prefilled: string): Promise<string | undefined>;
}

export interface NotesCommandContext {
  readonly cwd: string;
  readonly configDirName?: string;
  readonly hasUI: boolean;
  readonly ui: NotesCommandUi;
}
