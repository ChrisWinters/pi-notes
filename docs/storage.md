# Storage

## Directories

- Project scope: `<cwd>/.pi/notes/`
- Global scope: `~/.pi/notes/`

`/notes setup` initializes both directories if missing.

## Scope resolution

`NotesStorage` applies these rules:

1. If `--project`: project only
2. If `--global`: global only
3. If no scope flag: project first, then global fallback

For list/search in default mode:

- project and global notes are merged
- identical filenames resolve to project entries (project precedence)

## File naming

Names are normalized to safe slug filenames ending in `.md`.

Examples:

- `Project Ideas` -> `project-ideas.md`
- `Café notes!!!` -> `cafe-notes.md`

Unsafe names are rejected (traversal, path separators, absolute/home paths, control chars).

## Note format

Markdown with frontmatter:

```md
---
title: roadmap
updated: 2026-04-05T12:00:00.000Z
tags: [planning, pi]
---
# roadmap

...content...
```

Required frontmatter keys:

- `title`
- `updated`

Optional keys:

- `tags`

## Mutation behavior

All write paths (`writeNote`, `appendToNote`, rewrite apply, edit apply) refresh `updated` timestamp before persistence.

`move` preserves markdown content/frontmatter as-is while changing scope location.

## Setup and lifecycle operations

- `setup` is idempotent:
  - ensures `<cwd>/.pi/notes`
  - ensures `~/.pi/notes`
  - creates `~/.pi/notes/note.md` only if absent
- `uninstall` removes scope directories recursively after confirmation.
  - default target (no flags): project scope only
  - `--global`: global scope only
  - `--project --global`: both scopes

## Concurrency guarantees (audit-remediation update)

- `createNote` uses atomic exclusive creation (`wx`) to avoid check-then-write races.
- `writeNote`, `appendToNote`, and `moveNote` are serialized through per-key mutation queues.
- Concurrent appends to the same note are executed sequentially to prevent lost updates.
