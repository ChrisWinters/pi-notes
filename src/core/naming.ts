import { NotesValidationError } from "./errors.js";

export function normalizeNoteName(input: string): string {
  const value = input.trim().toLowerCase();

  if (value.length === 0) {
    throw new NotesValidationError("Note name cannot be empty.");
  }

  if (value.includes("..") || value.startsWith("/") || value.startsWith("~")) {
    throw new NotesValidationError("Unsafe note name. Use a simple name, not a path.");
  }

  const slug = value
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length === 0) {
    throw new NotesValidationError("Note name cannot resolve to an empty slug.");
  }

  return `${slug}.md`;
}
