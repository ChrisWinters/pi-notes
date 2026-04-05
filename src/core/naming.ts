import { NotesValidationError } from "./errors.js";

const PATH_SEPARATOR_PATTERN = /[\\/]/;
const MAX_NOTE_SLUG_LENGTH = 120;
const NOTE_FILE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

function containsControlCharacters(value: string): boolean {
  for (const char of value) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }

    if (codePoint < 32 || codePoint === 127) {
      return true;
    }
  }

  return false;
}

function stripMarkdownExtension(value: string): string {
  return value.toLowerCase().endsWith(".md") ? value.slice(0, -3) : value;
}

function assertSafeRawName(value: string): void {
  if (value.length === 0) {
    throw new NotesValidationError("EMPTY_NOTE_NAME", "Note name cannot be empty.");
  }

  if (
    value === "." ||
    value === ".." ||
    value.startsWith("/") ||
    value.startsWith("~") ||
    value.includes("..") ||
    PATH_SEPARATOR_PATTERN.test(value) ||
    containsControlCharacters(value)
  ) {
    throw new NotesValidationError("UNSAFE_NOTE_NAME", "Unsafe note name. Use a simple name, not a path.");
  }
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeNoteName(input: string): string {
  const trimmed = input.trim();
  assertSafeRawName(trimmed);

  const withoutExtension = stripMarkdownExtension(trimmed);
  const slug = slugify(withoutExtension);

  if (slug.length === 0) {
    throw new NotesValidationError("INVALID_NOTE_NAME", "Note name cannot resolve to an empty slug.");
  }

  if (slug.length > MAX_NOTE_SLUG_LENGTH) {
    throw new NotesValidationError(
      "NOTE_NAME_TOO_LONG",
      `Note name is too long. Maximum slug length is ${MAX_NOTE_SLUG_LENGTH} characters.`
    );
  }

  return `${slug}.md`;
}

export function assertSafeNoteFileName(fileName: string): void {
  if (!NOTE_FILE_PATTERN.test(fileName)) {
    throw new NotesValidationError("INVALID_NOTE_NAME", `Invalid note file name: ${fileName}`);
  }
}
