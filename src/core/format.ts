import { NotesValidationError } from "./errors.js";

export interface NoteFrontmatter {
  readonly title: string;
  readonly updated: string;
  readonly tags?: readonly string[];
}

export interface ParsedNote {
  readonly frontmatter: NoteFrontmatter;
  readonly body: string;
}

function parseTags(rawTags: string): readonly string[] {
  const trimmed = rawTags.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    throw new NotesValidationError("INVALID_NOTE_NAME", "Invalid tags frontmatter format.");
  }

  const inner = trimmed.slice(1, -1).trim();
  if (inner.length === 0) {
    return [];
  }

  return inner
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function parseNoteMarkdown(markdown: string): ParsedNote {
  const lines = markdown.split("\n");

  if (lines.length < 3 || lines[0] !== "---") {
    throw new NotesValidationError("INVALID_NOTE_NAME", "Missing frontmatter start delimiter.");
  }

  const endIndex = lines.indexOf("---", 1);
  if (endIndex === -1) {
    throw new NotesValidationError("INVALID_NOTE_NAME", "Missing frontmatter end delimiter.");
  }

  const metadata = new Map<string, string>();
  for (const line of lines.slice(1, endIndex)) {
    if (line.trim().length === 0) {
      continue;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    metadata.set(key, value);
  }

  const title = metadata.get("title");
  const updated = metadata.get("updated");

  if (title === undefined || updated === undefined) {
    throw new NotesValidationError("INVALID_NOTE_NAME", "Frontmatter requires title and updated fields.");
  }

  const tagsRaw = metadata.get("tags");
  const tags = tagsRaw === undefined ? undefined : parseTags(tagsRaw);
  const body = lines.slice(endIndex + 1).join("\n");

  const frontmatter: NoteFrontmatter =
    tags === undefined
      ? { title, updated }
      : {
          title,
          updated,
          tags
        };

  return {
    frontmatter,
    body
  };
}

export function renderNoteMarkdown(frontmatter: NoteFrontmatter, body: string): string {
  const lines = ["---", `title: ${frontmatter.title}`, `updated: ${frontmatter.updated}`];

  if (frontmatter.tags !== undefined) {
    lines.push(`tags: [${frontmatter.tags.join(", ")}]`);
  }

  lines.push("---", body);

  return lines.join("\n");
}

export function createEmptyNoteMarkdown(title: string, updatedIso: string): string {
  return renderNoteMarkdown(
    {
      title,
      updated: updatedIso
    },
    `# ${title}\n`
  );
}

export function withUpdatedTimestamp(markdown: string, updatedIso: string): string {
  const parsed = parseNoteMarkdown(markdown);
  return renderNoteMarkdown(
    {
      ...parsed.frontmatter,
      updated: updatedIso
    },
    parsed.body
  );
}
