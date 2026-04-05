export class NotesError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "NotesError";
  }
}

export class NotesValidationError extends NotesError {
  public constructor(message: string) {
    super(message);
    this.name = "NotesValidationError";
  }
}
