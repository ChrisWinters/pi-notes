# Storage

## Roots

In extension mode, project and global roots use Pi's exported `CONFIG_DIR_NAME`:

- project: `<cwd>/<CONFIG_DIR_NAME>/notes/`
- global: `~/<CONFIG_DIR_NAME>/notes/`

For standard Pi, `CONFIG_DIR_NAME` is `.pi`. The standalone `pi-notes` CLI deliberately defaults to `<cwd>/.pi/notes` and `~/.pi/notes` for compatibility; it has no implicit rebrand migration.

`setup` initializes both directories and creates the global starter `note.md` only when absent.

## Scope resolution

1. `--project`: project only.
2. `--global`: global only.
3. No flag: reads resolve project first and then global.
4. Default list/search merge both scopes; duplicate filenames use the project entry.
5. New notes default to project scope unless global is explicit.

## Names and format

Names normalize to safe slug filenames ending in `.md`, for example `Project Ideas` becomes `project-ideas.md`. Traversal, separators, absolute/home paths, control characters, and unsafe forms are rejected.

Notes are Markdown with frontmatter:

```md
---
title: roadmap
updated: 2026-04-05T12:00:00.000Z
tags: [planning, pi]
---

## roadmap
```

`title` and `updated` are required; `tags` is optional. Write/append/edit/rewrite refresh `updated`. Move and rename preserve Markdown/frontmatter while changing location or filename.

## Path invariants

Existing config components, notes roots, and note entries must be non-symlink regular directories/files of the expected type. Operations check canonical containment under the selected root. A symlink, broken link, wrong type, or escape causes a safe failure rather than being followed. These checks apply to reads as well as mutations, setup, and uninstall.

## Mutation coordination

- Atomic exclusive creation (`wx`) prevents duplicate create races.
- An injectable coordinator protects complete read-modify-write windows.
- Pi extension execution uses `withFileMutationQueue()` over resolved absolute target paths.
- Move/rename acquire unique target keys in sorted order and preserve coherence through source removal.
- Standalone CLI/internal storage uses a process-local queue.
- Separate CLI processes are not serialized with each other.
- Abort is checked before queueing, after waiting, between scan phases, and before mutation start. An abort before mutation changes no files.

## Lifecycle behavior

- `setup` is idempotent and never overwrites the starter note.
- `uninstall` defaults to project scope, accepts explicit global/both selection, and requires confirmation.
- Uninstall removes only a validated regular notes directory; it does not traverse a symlink target.
