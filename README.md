# pi-notes

A human-first notes extension for [Pi](https://github.com/badlogic/pi-mono), built to keep quick notes organized, searchable, and safe directly inside your Pi workflow.

- Pi project: https://github.com/badlogic/pi-mono
- pi-notes repo: https://github.com/ChrisWinters/pi-notes

## Summary

`pi-notes` adds a `/notes` command family to Pi so you can create, read, update, search, and safely remove notes without leaving your terminal flow.

Notes are stored in markdown and can live at:

- project scope: `.pi/notes/`
- global scope: `~/.pi/notes/`

## Install

```bash
pi install @ChrisWinters/pi-notes
```

## Commands

- `/notes ls [--project|--global]`
- `/notes show <name> [--project|--global]`
- `/notes new <name> [--project|--global]`
- `/notes append <name> <text> [--project|--global]`
- `/notes rm <name> [--project|--global]`
- `/notes grep <query> [--project|--global]`
- `/notes rewrite <name> <instruction> [--project|--global]`

### Scope behavior

Default behavior:

1. read from project scope first
2. fallback to global scope

Flags:

- `--project` -> project scope only
- `--global` -> global scope only

Parser semantics:

- scope flags are parsed only at argument edges (leading/trailing)
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
- Confirm-gated destructive and rewrite operations
- Markdown + frontmatter note format

## Docs

- Commands: `docs/commands.md`
- Storage model: `docs/storage.md`
- Security model: `docs/security.md`
- Architecture: `docs/architecture.md`
- Release guide: `docs/release.md`
- Plan history:
  - `docs/plans/completed/2026-04-05-pi-notes-mvp/`
  - `docs/plans/completed/2026-04-05-audit-remediation/`

## License

MIT — see [`LICENSE`](./LICENSE).
