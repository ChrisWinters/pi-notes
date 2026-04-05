# Commands

`pi-notes` exposes the `/notes` command family via `pi.registerCommand("notes", ...)`.

## Syntax

- `/notes ls [--project|--global]`
- `/notes show <name> [--project|--global]`
- `/notes new <name> [--project|--global]`
- `/notes append <name> <text> [--project|--global]`
- `/notes rm <name> [--project|--global]`
- `/notes grep <query> [--project|--global]`
- `/notes rewrite <name> <instruction> [--project|--global]`

## Examples

- `/notes new roadmap`
- `/notes append roadmap "add launch checklist"`
- `/notes show roadmap`
- `/notes grep checklist`
- `/notes rm roadmap`

## Scope flags

- `--project` -> only `.pi/notes/`
- `--global` -> only `~/.pi/notes/`
- no flag -> read default: project first, then global fallback

## Option parsing semantics

- scope flags are parsed as options only at argument edges (leading/trailing positions)
- flag-like tokens in the middle of content are preserved literally
- `--` marks end-of-options; everything after it is treated as literal content

Examples:

- `/notes append daily keep --global token` keeps `--global` in note content
- `/notes append daily note --global` applies global scope option
- `/notes grep -- --global` searches for literal `--global`

## UX behavior

- `ls` returns scope-tagged entries (`[project]` / `[global]`)
- `show` returns scope + path + note markdown
- `grep` returns either matches or explicit no-match feedback
- `rm` requires confirmation and is blocked when no UI is available
- `rewrite` requires editor + preview + confirmation before apply

## Non-interactive behavior

If `ctx.hasUI` is false:

- `rm` is blocked with an explicit error
- `rewrite` is blocked with an explicit error

## Command collision note

Pi may suffix duplicate command names when multiple extensions register the same command, for example `/notes:1`.
See: `docs/references/pi-extensions.md`.
