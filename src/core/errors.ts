export class NotesError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "NotesError";
  }
}

export type NotesValidationCode =
  | "EMPTY_NOTE_NAME"
  | "UNSAFE_NOTE_NAME"
  | "INVALID_NOTE_NAME"
  | "NOTE_NAME_TOO_LONG";

export class NotesValidationError extends NotesError {
  public readonly code: NotesValidationCode;

  public constructor(code: NotesValidationCode, message: string) {
    super(message);
    this.name = "NotesValidationError";
    this.code = code;
  }
}
