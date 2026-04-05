# pi-notes

A human-first notes extension for [Pi](https://github.com/badlogic/pi-mono), built to keep quick notes organized, searchable, and safe directly inside your Pi workflow.

## Summary

[pi-notes](https://github.com/ChrisWinters/pi-notes) adds a `/notes` command family to Pi so you can create, read, update, search, and safely remove notes without leaving your terminal flow.

Notes are stored in markdown and can live at:

- project scope: `.pi/notes/`
- global scope: `~/.pi/notes/`

## Install

```bash
pi install @tribalnerd/pi-notes
```

## Commands

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
- `/notes uninstall [--project] [--global]`

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
- flag-like tokens inside content are preserved as literal text
- use `--` to force all following tokens to be treated literally

## Purpose

- Keep lightweight human notes close to actual coding work
- Avoid context switching into separate apps/tools
- Maintain predictable command behavior and safe write/delete flows

## Features

- Deterministic note commands for CRUD + search
- Dual-scope storage (project + global)
- Safe name normalization and path protections
- Atomic note creation and serialized note mutations
- Confirm-gated destructive operations (`rm`, `uninstall`, overwrite move)
- Markdown-preserving editor workflow with `/notes edit`
- Bootstrap setup flow with starter global note (`/notes setup`)
- Markdown + frontmatter note format

## Docs

- Commands: `docs/commands.md`
- Storage model: `docs/storage.md`
- Security model: `docs/security.md`
- Architecture: `docs/architecture.md`
- Release guide: `docs/release.md`

## License

MIT — see [`LICENSE`](./LICENSE).
