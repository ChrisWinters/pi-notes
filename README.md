# pi-notes

A human-first notes extension built to keep quick notes organized, searchable, and safe directly inside your Pi workflow.

## Summary

[pi-notes](https://github.com/ChrisWinters/pi-notes) adds a `/notes` command family plus agent-facing `notes_*` tools to Pi so you can create, read, update, search, and safely remove notes without leaving your terminal flow.

Notes are stored as Markdown in project or global scope. The extension honors Pi's configured directory name (`<cwd>/<CONFIG_DIR_NAME>/notes` and `~/<CONFIG_DIR_NAME>/notes`); standard Pi and the standalone CLI use `.pi/notes` and `~/.pi/notes`.

## Install

```bash
pi install npm:@tribalnerd/pi-notes
```

## Bundled agent skill

This package also ships a `pi-notes` skill (`skills/pi-notes/SKILL.md`) for agent-side routing.

- Invokable as `/skill:pi-notes`
- Guides note intent resolution (global vs project)
- Prefers registered `notes_*` tools when available
- Falls back to `/notes` or the package CLI for restricted or unavailable tool flows
- Uses safe handoff for restricted/destructive operations

## Commands

Pi extension command family:

- `/notes` (usage/help)
- `/notes help`
- `/notes commands`
- `/notes setup`
- `/notes ls [--project|--global]`
- `/notes show <name> [--project|--global]`
- `/notes new <name> [--project|--global]`
- `/notes edit <name> [--project|--global]`
- `/notes append <name> <text> [--project|--global]`
- `/notes rm <name> [--project|--global]`
- `/notes grep <query> [--project|--global]`
- `/notes rewrite <name> <instruction> [--project|--global]`
- `/notes move <name> --to-global|--to-project [--project|--global] [--overwrite]`
- `/notes rename <from> <to> [--project|--global] [--overwrite]`
- `/notes uninstall [--project] [--global]`

Agent-facing tools registered by the extension:

- `notes_setup`
- `notes_list`
- `notes_show`
- `notes_new`
- `notes_append`
- `notes_grep`
- `notes_rename`
- `notes_move`

Destructive/editor flows intentionally remain command/CLI handoffs instead of agent tools. Agent move/rename tools expose no overwrite option; conflicts return the exact `/notes ... --overwrite` command for the user to run and confirm.

List/show/grep tool output, including its recovery notice, is bounded to 2,000 lines or 50KB. Complete truncated results use owner-only OS temporary artifacts scheduled for deletion after 24 hours; stale artifacts are also reclaimed on later extension startup/output creation.

Package CLI (deterministic non-interactive flows):

CLI invocation options:

- `npx @tribalnerd/pi-notes <command> ...` (works without global install)
- `pi-notes <command> ...` (requires global npm install/link)
- `node dist/src/cli.js <command> ...` (repo-local/dev)

Examples:

- `npx @tribalnerd/pi-notes show <name> [--project|--global]`
- `npx @tribalnerd/pi-notes new <name> [--project|--global]`
- `npx @tribalnerd/pi-notes append <name> <text> [--project|--global]`
- `npx @tribalnerd/pi-notes ls [--project|--global]`
- `npx @tribalnerd/pi-notes grep <query> [--project|--global]`
- `npx @tribalnerd/pi-notes move <name> --to-global|--to-project [--project|--global] [--overwrite]`
- `npx @tribalnerd/pi-notes rename <from> <to> [--project|--global] [--overwrite]`
- `npx @tribalnerd/pi-notes rm <name> [--project|--global] [--yes]`
- `npx @tribalnerd/pi-notes uninstall [--project] [--global] [--yes]`

### Scope behavior

Default behavior:

1. read from project scope first
2. fallback to global scope

Flags:

- `--project` -> project scope only
- `--global` -> global scope only

Parser semantics:

- scope flags are parsed only at argument edges (leading/trailing)
- move flags (`--to-global`, `--to-project`, `--overwrite`) are parsed only for `/notes move` and only at argument edges
- rename recognizes `--overwrite` only at argument edges
- flag-like tokens inside content are preserved as literal text
- use `--` to force all following tokens to be treated literally

## Purpose

- Keep lightweight human notes close to actual coding work
- Avoid context switching into separate apps/tools
- Maintain predictable command behavior and safe write/delete flows

## Features

- Deterministic note commands for CRUD + search
- Dual-scope storage (project + global)
- Lexical name validation, strict symlink rejection, regular-path checks, and canonical containment
- Atomic creation plus Pi-wide mutation coordination in extension mode and in-process coordination in CLI mode
- Cancellation checks before queued mutations
- Confirm-gated destructive operations (`rm`, `uninstall`, overwrite move/rename)
- Markdown-preserving editor workflow with `/notes edit`
- Bootstrap setup flow with starter global note (`/notes setup`)
- Markdown + frontmatter note format

## Pi modes

Interactive TUI and RPC `/notes` commands use Pi notifications/dialogs. Direct `/notes` in print or JSON mode is intentionally unsupported and emits an observable stderr error with the equivalent `pi-notes ...` CLI handoff; use the CLI for reliable headless output and exit status.

## Docs

- Documentation index: `docs/README.md`
- Commands: `docs/commands.md`
- Storage model: `docs/storage.md`
- Security model: `docs/security.md`
- Architecture: `docs/architecture.md`
- Release guide: `docs/release.md`
