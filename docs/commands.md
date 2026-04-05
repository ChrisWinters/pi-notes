# Commands

`pi-notes` exposes the `/notes` command family via `pi.registerCommand("notes", ...)`.

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
- `/notes uninstall [--project] [--global]`

## Examples

- `/notes setup`
- `/notes new roadmap`
- `/notes edit roadmap`
- `/notes append roadmap "add launch checklist"`
- `/notes show roadmap`
- `/notes move roadmap --to-global --project`
- `/notes uninstall --project`

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

If `ctx.hasUI` is false:

- `rm` is blocked with an explicit error
- `rewrite` is blocked with an explicit error
- `edit` is blocked with an explicit error
- `uninstall` is blocked with an explicit error
- `move --overwrite` confirmation flow is blocked with an explicit error

## Command collision note

Pi may suffix duplicate command names when multiple extensions register the same command, for example `/notes:1`.
See upstream Pi extensions docs: https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md
