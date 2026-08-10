# Commands

pi-notes exposes `/notes` through Pi, safe agent-facing `notes_*` tools, and the standalone `pi-notes` CLI. The bundled `pi-notes` skill prefers tools and hands restricted operations back to the user.

## Slash command syntax

- `/notes` / `/notes help` / `/notes commands`
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

## Agent tools

Registered tools are `notes_setup`, `notes_list`, `notes_show`, `notes_new`, `notes_append`, `notes_grep`, `notes_rename`, and `notes_move`.

Delete, uninstall, edit, rewrite, and overwrite confirmation are intentionally not agent-authorized. `notes_rename` and `notes_move` expose no `overwrite` property. On a destination conflict they fail with an exact interactive handoff, for example:

```text
/notes rename source target --project --overwrite
/notes move source --to-global --project --overwrite
```

The user must run and confirm that command. The complete list/show/grep result text, including its recovery notice, is limited to 2,000 lines or 50KB. When truncated, the result includes a private full-output artifact path and structured truncation metadata. Deletion is scheduled after 24 hours while the host is alive; stale files are also reclaimed on later extension startup/output creation.

## CLI

Use `pi-notes`, `npx @tribalnerd/pi-notes`, or repository-local `node dist/src/cli.js`:

- `pi-notes ls|show|new|append|grep ... [--project|--global]`
- `pi-notes move <name> --to-global|--to-project [--project|--global] [--overwrite]`
- `pi-notes rename <from> <to> [--project|--global] [--overwrite]`
- `pi-notes rm <name> [--project|--global] [--yes]`
- `pi-notes uninstall [--project] [--global] [--yes]`

CLI edit/rewrite are not provided; use interactive `/notes`. In non-interactive CLI sessions, delete/uninstall fail unless `--yes` is explicit. Failed or cancelled requested operations return a nonzero status.

## Scope and parsing

- `--project` selects project scope only.
- `--global` selects global scope only.
- No scope flag reads project first and then global; list/grep merge both with project precedence.
- Scope flags are options only at argument edges.
- Move destination and overwrite flags are options only at argument edges for `move`; `--overwrite` is also recognized at argument edges for `rename`.
- `--` makes all following tokens literal.

Examples:

```text
/notes append daily keep --global token
/notes append daily note --global
/notes grep -- --global
/notes move roadmap --to-global --project
```

## UX and mode matrix

| Surface | Read results | Dialog/editor | Failure behavior |
| --- | --- | --- | --- |
| Pi TUI | UI notification | Supported | Error/warning/cancellation notification |
| Pi RPC | Extension UI protocol notification | Protocol request/default behavior | Protocol-visible notification |
| Pi print | Unsupported direct command; stderr gives `pi-notes ...` | Unsupported | Observable extension error on stderr |
| Pi JSON | Session JSON remains on stdout; stderr gives `pi-notes ...` | Unsupported | Observable extension error on stderr |
| Agent tool | Bounded tool result | Not exposed | Throws so Pi records a tool error |
| CLI | stdout/stderr | TTY confirmation or `--yes` for destructive actions | Nonzero exit status |

Direct print/JSON `/notes` currently inherits Pi's process exit behavior, which may remain zero even though stderr contains the extension error. Scripts should invoke `pi-notes` directly for reliable output and exit status.

Pi may suffix duplicate command names, for example `/notes:1`.
