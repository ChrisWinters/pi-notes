import { describe, expect, it } from "vitest";

import { NotesValidationError } from "../src/core/errors.js";
import { assertSafeNoteFileName, normalizeNoteName } from "../src/core/naming.js";

describe("normalizeNoteName", () => {
  it("normalizes spaces and case", () => {
    expect(normalizeNoteName("Project Ideas")).toBe("project-ideas.md");
  });

  it("enforces .md extension internally", () => {
    expect(normalizeNoteName("Project Ideas.md")).toBe("project-ideas.md");
  });

  it("removes accents and punctuation", () => {
    expect(normalizeNoteName("Café notes!!!")).toBe("cafe-notes.md");
  });

  it("rejects traversal-like names", () => {
    expect(() => normalizeNoteName("../secrets")).toThrowError(NotesValidationError);
    expect(() => normalizeNoteName("a/b")).toThrowError(NotesValidationError);
    expect(() => normalizeNoteName("a\\b")).toThrowError(NotesValidationError);
    expect(() => normalizeNoteName("/etc/passwd")).toThrowError(NotesValidationError);
    expect(() => normalizeNoteName("~/.ssh/config")).toThrowError(NotesValidationError);
  });

  it("rejects empty and punctuation-only names", () => {
    expect(() => normalizeNoteName("   ")).toThrowError(NotesValidationError);
    expect(() => normalizeNoteName("!!!")).toThrowError(NotesValidationError);
  });

  it("rejects overly long slugs", () => {
    const longInput = `note-${"a".repeat(130)}`;
    expect(() => normalizeNoteName(longInput)).toThrowError(NotesValidationError);
  });
});

describe("assertSafeNoteFileName", () => {
  it("accepts valid normalized names", () => {
    expect(() => assertSafeNoteFileName("project-ideas.md")).not.toThrow();
  });

  it("rejects non-normalized or unsafe filenames", () => {
    expect(() => assertSafeNoteFileName("Project Ideas.md")).toThrowError(NotesValidationError);
    expect(() => assertSafeNoteFileName("project_ideas.md")).toThrowError(NotesValidationError);
    expect(() => assertSafeNoteFileName("../project-ideas.md")).toThrowError(NotesValidationError);
    expect(() => assertSafeNoteFileName("project-ideas.txt")).toThrowError(NotesValidationError);
  });
});
