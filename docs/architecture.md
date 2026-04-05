# Architecture

`pi-notes` is a Pi extension with command-first design and a deterministic storage core.

## Modules

- `src/index.ts`
  - registers `/notes` command via `pi.registerCommand`
- `src/commands/notes.ts`
  - parses command arguments and scope flags
  - orchestrates command-specific flows (`ls/show/new/append/rm/grep/rewrite`)
- `src/core/naming.ts`
  - note-name normalization and filename safety validation
- `src/core/storage.ts`
  - scope-aware filesystem operations and note lifecycle
- `src/core/format.ts`
  - frontmatter parse/render and timestamp update helpers
- `src/core/errors.ts`
  - typed error model for domain validation
- `src/ui/render.ts`
  - textual presentation helpers for list/show/search/rewrite preview

## Data flow

1. `/notes ...` command enters `handleNotesCommand()`
2. flags/subcommand parsed
3. storage and naming layers enforce safety and scope rules
4. result rendered and surfaced via `ctx.ui.notify`
5. confirm-gated operations use `ctx.ui.confirm` (and `ctx.hasUI` checks)

## Pi alignment

This repository tracks Pi extension contract behavior against upstream Pi docs:

- https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md

Key contracts followed:

- extension default export + `ExtensionAPI`
- command registration through `pi.registerCommand`
- non-interactive safeguards using `ctx.hasUI`
- awareness of command name collision suffixing (`/notes:1` pattern)
