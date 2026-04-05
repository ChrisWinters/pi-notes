# PRD: pi-notes MVP

## 1. Problem

Users need a reliable, low-friction way to keep human-oriented notes inside Pi workflows, without mixing ad hoc files, losing context across projects, or relying on non-deterministic edits.

## 2. Goals

- Provide first-class note management through a dedicated `/notes` command family.
- Support project-local and global note scopes.
- Keep storage human-readable (markdown + lightweight frontmatter).
- Ensure safety for destructive and AI-mutating operations.
- Ship as a clean public package ready for GitHub and npm.

## 3. Non-Goals (MVP)

- Graph/database note backends
- Real-time sync or collaboration
- Full-text indexing service beyond basic grep/search
- Autonomous note rewriting without explicit user action

## 4. Users

Primary:
- Solo developer/creator using Pi in terminal workflows.

Secondary:
- Contributors adopting `pi-notes` as a reusable extension package.

## 5. User Stories

1. As a user, I can create a named note quickly.
2. As a user, I can view a note in-session.
3. As a user, I can append information deterministically.
4. As a user, I can search notes by query.
5. As a user, I can delete a note safely with confirmation.
6. As a user, I can ask for an AI rewrite but review and confirm before file mutation.

## 6. Functional Requirements

### Commands

- `/notes ls [--project|--global]`
- `/notes show <name> [--project|--global]`
- `/notes new <name> [--project|--global]`
- `/notes append <name> <text> [--project|--global]`
- `/notes rm <name> [--project|--global]`
- `/notes grep <query> [--project|--global]`
- `/notes rewrite <name> <instruction> [--project|--global]`

Optional alias (later, if safe):
- `/notes <name>` => `/notes show <name>`

### Scope Resolution

Default:
1. project note path `.pi/notes/`
2. fallback to global `~/.pi/notes/`

Override flags:
- `--project` forces project-only
- `--global` forces global-only

### Storage

- File extension: `.md`
- Name normalization: safe slug format
- Frontmatter keys (minimum):
  - `title`
  - `updated`
  - optional `tags`

### Safety

- Reject path traversal and absolute paths
- Confirm before delete
- Rewrite must show proposal/preview and require explicit approval
- No silent destructive overwrite

### Pi Extension Contract (from local snapshot)

Reference file: `docs/references/pi-extensions.md`

Required implementation alignment:

- Register `/notes` using `pi.registerCommand(name, options)`.
- Implement the extension as default export function receiving `ExtensionAPI`.
- Place extension in a Pi-discoverable location for `/reload` workflows (project-local `.pi/extensions/*` and/or packaged install path).
- Handle command-name collisions explicitly in docs because Pi may suffix duplicate commands (e.g. `/notes:1`).
- Guard UI-only interactions (`ctx.ui.confirm`) behind `ctx.hasUI` behavior for non-interactive modes.
- Keep command behavior deterministic for file operations and isolate AI mutation to explicit rewrite flow.

Relevant sections in snapshot:
- "Extension Locations"
- "pi.registerCommand(name, options)"
- "Mode Behavior"
- "Custom Tools" (optional follow-on for natural-language tool support)

## 7. Non-Functional Requirements

- Strict TypeScript and ESLint policy
- Deterministic behavior for non-AI commands
- Clear, actionable error messages
- Public repo readability and maintainability

## 8. Edge Cases

- Names with spaces/punctuation
- Duplicate names across scopes
- Empty notes
- Large notes (display truncation strategy)
- Rewrite on missing note
- Non-interactive mode behavior for confirm-gated actions

## 9. Acceptance Criteria

1. All MVP commands are implemented and documented.
2. Core tests cover naming, storage, command parsing, and safety behavior.
3. Delete and rewrite flows require explicit confirmation.
4. Lint/typecheck/test/build pass in CI.
5. README documents installation, usage, and safety model.

## 10. Release Criteria (v0.1.0 target)

- Green CI pipeline
- Changelog entry
- Public-facing docs complete
- Manual smoke test recorded in plan evidence
