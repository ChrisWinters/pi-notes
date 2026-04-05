# Security

## Safety posture

`pi-notes` is deterministic-first and blocks unsafe file/path behavior.

## Input/path protections

- note names are normalized and validated
- path traversal is rejected (`..`, separators, absolute path patterns)
- unsafe filename forms are rejected before filesystem operations

## Destructive action guard

`/notes rm`:

- resolves target note first
- requires explicit confirmation before deletion
- emits clear cancellation/not-found messages

`/notes uninstall`:

- scope-targeted recursive removal (`--project`, `--global`, or both)
- defaults to project scope when no flag is given
- requires explicit confirmation before deletion
- emits clear cancellation/not-found messages

## Rewrite mutation guard

`/notes rewrite`:

- loads the note in editor for proposal changes
- shows a rewrite preview
- requires explicit confirmation before write
- cancellation path performs no file mutation

## Non-interactive mode behavior

When `ctx.hasUI` is false, confirm-gated or editor-gated commands are blocked with explicit messages:

- `/notes rm`
- `/notes rewrite`
- `/notes edit`
- `/notes uninstall`
- `/notes move --overwrite`

## Concurrency hardening

- atomic file creation is used for note creation to reduce TOCTOU risk
- mutation operations are serialized per target key to reduce lost-update races
- move operations are serialized per note key to avoid split-brain move outcomes

## Privacy

Storage locations:

- project-local `.pi/notes/`
- user-global `~/.pi/notes/`

No network syncing is performed by this extension.
