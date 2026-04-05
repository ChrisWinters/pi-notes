# Storage

## Directories

- Project scope: `<cwd>/.pi/notes/`
- Global scope: `~/.pi/notes/`

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

All write paths (`writeNote`, `appendToNote`, rewrite apply) refresh `updated` timestamp before persistence.

## Concurrency guarantees (audit-remediation update)

- `createNote` uses atomic exclusive creation (`wx`) to avoid check-then-write races.
- `writeNote` and `appendToNote` are serialized through per-key mutation queues.
- Concurrent appends to the same note are executed sequentially to prevent lost updates.
