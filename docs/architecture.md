# Architecture

`pi-notes` is a Pi extension with tool-first agent support, a `/notes` command family, a package CLI, and a deterministic storage core.

## Modules

- `extensions/pi-notes/index.ts`
  - package-specific Pi extension entrypoint declared by `package.json`
  - delegates to `src/index.ts` without duplicating registration logic
- `src/index.ts`
  - implements the `/notes` command registration via `pi.registerCommand`
  - registers agent-facing `notes_*` tools via `pi.registerTool`
  - adapts tool execution through shared command handlers, tool error signaling, and output truncation
- `src/cli.ts`
  - package CLI entrypoint (`pi-notes ...`) for deterministic script/terminal usage
- `skills/pi-notes/SKILL.md`
  - packaged agent skill for tool-first note routing with `/notes`/CLI fallback guidance
- `src/commands/notes.ts`
  - parses command arguments and scope flags
  - orchestrates command-specific flows (`ls/show/new/append/rm/grep/rewrite/move/rename/uninstall`)
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

1. `/notes ...` command enters `handleNotesCommand()`, or a `notes_*` tool maps parameters to command argv.
2. flags/subcommand parsed through the shared parser/handler flow.
3. storage and naming layers enforce safety and scope rules.
4. command results are rendered and surfaced via `ctx.ui.notify` (or CLI stdout/stderr).
5. tool execution captures notifications, throws on error-level messages, and truncates successful output before returning it to the model.
6. confirm-gated operations use `ctx.ui.confirm` (and `ctx.hasUI` checks); destructive/editor flows are intentionally not exposed as agent tools.

## Pi alignment

This repository tracks Pi extension contract behavior against upstream Pi docs:

- https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/extensions.md

Key contracts followed:

- extension default export + `ExtensionAPI`
- command registration through `pi.registerCommand`
- custom tool registration through `pi.registerTool`
- tool failures throw from `execute` so Pi can mark tool execution as failed
- tool output is truncated before returning to the model
- non-interactive safeguards using `ctx.hasUI`
- awareness of command name collision suffixing (`/notes:1` pattern)
- CLI and tools reuse command parser + handlers to reduce behavior drift between `/notes`, `notes_*`, and `pi-notes`
