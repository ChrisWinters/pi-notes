# Commands

`pi-notes` exposes three surfaces:

- `/notes` command family via `pi.registerCommand("notes", ...)`
- agent-facing `notes_*` tools via `pi.registerTool(...)`
- `pi-notes` package CLI (`bin`) for deterministic script/terminal usage

It also bundles a skill at `skills/pi-notes/SKILL.md` (invokable as `/skill:pi-notes`) to guide intent routing. The skill prefers registered `notes_*` tools when available, then falls back to `/notes` or the CLI for restricted or unavailable tool flows.

## Syntax

- `/notes`
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

Agent tool equivalents:

- `notes_setup`
- `notes_list`
- `notes_show`
- `notes_new`
- `notes_append`
- `notes_grep`
- `notes_rename`
- `notes_move`

No destructive/editor tools are registered; `rm`, `uninstall`, `edit`, and `rewrite` remain explicit command/CLI handoffs.

CLI equivalents:

- `pi-notes ls [--project|--global]`
- `pi-notes show <name> [--project|--global]`
- `pi-notes new <name> [--project|--global]`
- `pi-notes append <name> <text> [--project|--global]`
- `pi-notes rm <name> [--project|--global] [--yes]`
- `pi-notes grep <query> [--project|--global]`
- `pi-notes move <name> --to-global|--to-project [--project|--global] [--overwrite]`
- `pi-notes rename <from> <to> [--project|--global] [--overwrite]`
- `pi-notes uninstall [--project] [--global] [--yes]`

## Examples

- `/notes setup`
- `/notes new roadmap`
- `/notes edit roadmap`
- `/notes append roadmap "add launch checklist"`
- `/notes show roadmap`
- `/notes move roadmap --to-global --project`
- `/notes rename roadmap roadmap-q2 --project`
- `/notes uninstall --project`
- `pi-notes show npm --global`
- `pi-notes rm npm --global --yes`

## Scope flags

- `--project` -> only `.pi/notes/`
- `--global` -> only `~/.pi/notes/`
- no flag -> read default: project first, then global fallback

## Option parsing semantics

- scope flags are parsed as options only at argument edges (leading/trailing positions)
- move flags (`--to-project`, `--to-global`, `--overwrite`) are parsed as options only for `/notes move` and only at argument edges
- flag-like tokens in the middle of content are preserved literally
- `--` marks end-of-options; everything after it is treated as literal content

Examples:

- `/notes append daily keep --global token` keeps `--global` in note content
- `/notes append daily note --global` applies global scope option
- `/notes grep -- --global` searches for literal `--global`
- `/notes move handoff -- --to-global` treats `--to-global` as literal argument text

## UX behavior

- `setup` ensures project/global note directories and seeds global `note.md` if missing
- `setup` always reminds user: `Run /notes show note --global`
- `ls` returns scope-tagged entries (`[project]` / `[global]`)
- `show` returns scope + path + note markdown
- `edit` opens full markdown in editor and preserves spacing/newlines/paragraphs
- `grep` returns either matches or explicit no-match feedback
- `rm` requires confirmation and is blocked when no UI is available
- `rewrite` requires editor + preview + confirmation before apply
- `move` requires explicit destination flag and supports optional `--overwrite`
- `uninstall` defaults to project scope and requires confirmation

## Non-interactive behavior

For `/notes` in Pi, if `ctx.hasUI` is false:

- `rm` is blocked with an explicit error
- `rewrite` is blocked with an explicit error
- `edit` is blocked with an explicit error
- `uninstall` is blocked with an explicit error
- `move --overwrite` confirmation flow is blocked with an explicit error

For `pi-notes` CLI:

- destructive operations (`rm`, `uninstall`) require interactive confirmation unless `--yes` is provided
- if no interactive TTY and no `--yes`, destructive actions fail safely
- CLI `edit`/`rewrite` are intentionally not provided; use interactive `/notes` for editor-based flows

## Command collision note

Pi may suffix duplicate command names when multiple extensions register the same command, for example `/notes:1`.
See upstream Pi extensions docs: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/extensions.md
