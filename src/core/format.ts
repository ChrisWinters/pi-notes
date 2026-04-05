export interface NoteFrontmatter {
  readonly title: string;
  readonly updated: string;
  readonly tags?: readonly string[];
}

export function createEmptyNoteMarkdown(title: string, updatedIso: string): string {
  return [
    "---",
    `title: ${title}`,
    `updated: ${updatedIso}`,
    "---",
    `# ${title}`,
    "",
    ""
  ].join("\n");
}
