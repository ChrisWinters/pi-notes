# PRD: pi-notes CLI Surface

## Problem

Agents and users may need to perform note operations in non-interactive or scripted contexts. Relying on implicit extension behavior or direct filesystem paths is brittle and can conflict with safety constraints.

A package-owned CLI gives deterministic operations and a stable interface for both humans and automation.

## Goals

1. Provide a stable CLI command set for note management.
2. Resolve note storage paths cross-platform without requiring users to know npm install paths.
3. Support global/project scope deterministically.
4. Keep mutation flows explicit and confirm-gated for destructive actions.
5. Preserve clear error output and non-zero exit codes on failures.

## Non-goals

- Replacing extension commands; CLI complements them.
- Introducing silent destructive behavior.
- Requiring users to manually locate package install directories.

## Users

- Pi users running commands manually.
- Agents invoking a deterministic backend.
- CI/local scripts needing stable note operations.

## Functional requirements

### FR1 — CLI entrypoint

Package exposes executable `pi-notes` via `package.json` `bin`.

### FR2 — Core command set

Initial command coverage:

- `show <name>` (read)
- `new <name>` (create)
- `append <name> <text>`
- `edit <name>` / `update <name>` (deterministic non-interactive form)
- `rm <name>` (destructive, confirm-gated)
- `move <name>` / `rename <from> <to>`

(Exact initial subset can be phased; must be documented.)

### FR3 — Scope flags

- `--global` targets global notes root.
- `--project` targets project notes root.
- Scope conflict (`--global` and `--project`) returns actionable error.
- Missing scope defaults must be explicit and documented (or require scope).

### FR4 — Path resolution contract

- Global root resolves via runtime home directory (`os.homedir()` + `.pi/notes`).
- Project root resolves from `cwd` using package note-root rules.
- Reject unsafe traversal/escape paths.

### FR5 — Output contract

- Read commands emit note content (or machine-friendly mode if provided).
- Mutations emit concise success messages with resolved path.
- Errors are concise, actionable, and return non-zero exit code.

### FR6 — Confirmation and non-interactive behavior

- Destructive commands require explicit confirm unless force flag is passed.
- Non-interactive contexts must fail safely when confirm is required and unavailable.

### FR7 — Shared logic

CLI and extension command handlers should call shared core note services to avoid behavior drift.

## UX requirements

- Command help includes examples for global and project scopes.
- Messages avoid exposing internals unrelated to user action.
- Behavior is deterministic and script-friendly.

## Success criteria

- Users can manage notes without direct filesystem editing.
- Agent workflows use CLI/backend deterministically.
- Cross-platform path behavior validated in tests/smoke checks.

## Risks

- Grammar drift between `/notes` and `pi-notes` CLI.
- Cross-platform path inconsistencies.
- Confirmation behavior ambiguity in scripted contexts.

## Mitigations

- Reuse parser/command services where possible.
- Add explicit tests for path and scope handling.
- Document interactive vs non-interactive confirmation behavior.
