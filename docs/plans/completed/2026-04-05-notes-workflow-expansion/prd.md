# PRD: Notes Workflow Expansion

## 1. Problem

Testing surfaced practical gaps in the current command surface:

- Markdown-heavy note authoring is awkward when content is passed only as shell-like args.
- There is no first-class command to remove note stores intentionally.
- There is no command to move notes between project/global scope.
- Command discoverability can be improved with explicit help/list behavior.
- Setup/bootstrap behavior is implicit and unclear; users want a guided first-run setup.

## 2. Goals

- Add markdown-preserving author/edit flows.
- Add explicit, confirm-gated uninstall flows.
- Add explicit move flow between project/global scopes.
- Add explicit help/listing command behavior.
- Add `/notes setup` to create standard directories and a starter global note.

## 3. Non-goals

- Auto-running setup on install.
- Silent destructive cleanup.
- Breaking existing `/notes new|append|show|ls|grep|rm|rewrite` behavior.

## 4. Users impacted

- Primary: Pi users maintaining notes across many repos.
- Secondary: maintainers who need deterministic, testable command semantics.

## 5. Proposed command contract

### 5.1 Help/list commands

- `/notes` → show usage/help (existing behavior, keep)
- `/notes help` → explicit help output (new)
- `/notes commands` → alias of help output (new)

Acceptance:
- Help text includes all supported subcommands, flags, and scope behavior notes.

### 5.2 Setup command

- `/notes setup`

Behavior:
- Ensure project directory exists: `<cwd>/.pi/notes`
- Ensure global directory exists: `~/.pi/notes`
- Ensure starter global note exists: `~/.pi/notes/note.md`
  - if missing: create with "How to use notes" guidance markdown
  - if present: do not overwrite
- After setup, print follow-up guidance:
  - `Run /notes show note --global`

Acceptance:
- Command is idempotent.
- Existing `note.md` content is preserved.
- Output clearly states what was created vs already existed.

### 5.3 Move command

- `/notes move <name> --to-global [--project]`
- `/notes move <name> --to-project [--global]`
- Optional: `--overwrite` (explicitly opt-in replacement)

Behavior:
- Source resolution uses current scope rules unless source scope is forced.
- Destination must be explicit (`--to-global` or `--to-project`).
- Default behavior on destination collision: fail with clear message.
- With `--overwrite`: replace destination atomically and remove source.

Acceptance:
- Successful move results in exactly one destination note.
- Metadata and markdown content preserved.
- Collision behavior is deterministic and tested.

### 5.4 Uninstall command

- `/notes uninstall [--project] [--global]`

Behavior:
- If no scope flag provided: target project scope only (safe default).
- `--project`: remove `<cwd>/.pi/notes` (recursive).
- `--global`: remove `~/.pi/notes` (recursive).
- Both flags: remove both.
- Always confirm before destructive action when UI is available.
- In non-interactive/no-UI mode: refuse destructive execution with clear guidance.

Acceptance:
- Destructive actions are confirm-gated.
- Non-interactive mode never performs delete.
- User gets post-action summary of what was deleted/skipped.

### 5.5 Markdown-friendly formatting flow

- `/notes edit <name> [--project|--global]` (new)

Behavior:
- Open current note content in editor (`ctx.ui.editor`) for full markdown editing.
- On save/confirm, write exact content (with existing timestamp update policy).
- On cancel, no mutation.

Optional extension (same ticket if low-risk):
- `/notes new <name> --edit` to create then open in editor.

Acceptance:
- Multi-paragraph markdown, spacing, and blank lines are preserved exactly.
- Cancel path is no-op.

## 6. Non-functional requirements

- Deterministic command parsing.
- No implicit external/network behavior.
- Strict TypeScript + ESLint compliance.
- User-facing errors remain actionable and explicit.

## 7. Security and safety requirements

- Keep path normalization and traversal protections.
- Confirm gate all destructive flows (`uninstall`, `move --overwrite` if destructive).
- Preserve explicit consent model for any AI rewrite mutation.

## 8. Documentation updates required

- `README.md` command list + setup section
- `docs/commands.md` grammar and examples
- `docs/storage.md` for setup/move/uninstall effects
- `docs/security.md` for confirm-gated destructive semantics
- `docs/release.md` smoke test checklist additions

## 9. Acceptance criteria

1. `/notes setup` creates required dirs and starter global `note.md` idempotently.
2. Setup output includes: `Run /notes show note --global`.
3. Help commands expose the full command surface clearly.
4. `/notes move` works across scopes with deterministic collision handling.
5. `/notes uninstall` is safe-by-default and confirm-gated.
6. Markdown-friendly editing preserves formatting and supports cancel/no-op.
7. Quality gate passes with tests covering new behavior and edge cases.
