# pi-notes

`pi-notes` is a Pi extension for human-focused notes with deterministic command flows, explicit scope handling, and safety-first mutation rules.

> Status: MVP shipped; audit-remediation plan active (`docs/plans/active/2026-04-05-audit-remediation/`).

## Features

- Deterministic note commands for create/read/update/delete/list/search
- Dual scope storage:
  - project: `.pi/notes/`
  - global: `~/.pi/notes/`
- Safe name normalization + path traversal protection
- Confirm-gated destructive and rewrite flows

## Command reference

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

Parsing semantics (audit-remediation update):

- scope flags are parsed at argument edges (leading/trailing option positions)
- mid-content flag-like tokens are preserved as literal content
- use `--` to force all following tokens to be treated literally

### Rewrite behavior (current MVP)

`/notes rewrite` opens an editor prefilled with the current note, shows a preview, then asks for explicit confirmation before writing.

The `<instruction>` argument is currently treated as user intent metadata and included in success messaging.

## Installation

### Local development install (project path)

Use a local extension path while developing. Keep extension entry under project source and load through your Pi extension workflow.

### npm package install (target after publish)

Add package reference in Pi settings/packages once published:

- `npm:pi-notes@<version>`

### Git package install (alternative)

Add git reference in Pi settings/packages:

- `git:github.com/<your-username>/pi-notes@<tag-or-branch>`

## Pi compatibility notes

Reference snapshot used by this repo:

- `docs/references/pi-extensions.md`

Important behavior:

- command names can be suffixed by Pi when collisions exist (for example `/notes:1`)
- non-interactive contexts can restrict confirm-gated flows; `pi-notes` checks `ctx.hasUI`

## Development

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

## Planning and specs

- Active remediation plan: `docs/plans/active/2026-04-05-audit-remediation/`
- Latest completed plan: `docs/plans/completed/2026-04-05-pi-notes-mvp/`
