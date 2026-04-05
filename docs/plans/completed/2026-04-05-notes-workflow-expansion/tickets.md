# Tickets: Notes Workflow Expansion

Status legend: `ready` | `in_progress` | `blocked` | `done`

## T-1001 — Define command grammar and parser extensions
- Status: done
- Story: 1, 3
- Goal: Add grammar support for new subcommands/flags without breaking existing semantics.
- Scope:
  - add parsing for `help`, `commands`, `setup`, `move`, `uninstall`, `edit`
  - add target flags for move: `--to-global`, `--to-project`, optional `--overwrite`
  - preserve edge-only scope flag behavior and `--` literal handling
- Implementation targets:
  - `src/commands/parser.ts`
  - `src/commands/shared.ts`
- Validation:
  - ✅ parser unit tests for new grammar + conflicts (`tests/parser.test.ts`)
  - ✅ `npm run test -- tests/parser.test.ts`
  - ✅ `npm run typecheck`
- Evidence:
  - `docs/plans/completed/2026-04-05-notes-workflow-expansion/evidence/t-1001-parser-matrix.md`

## T-1002 — Implement `/notes setup` with starter global note
- Status: done
- Story: 1
- Goal: Provide explicit setup bootstrap flow and first-use guidance.
- Scope:
  - ensure `<cwd>/.pi/notes` and `~/.pi/notes`
  - create `~/.pi/notes/note.md` if absent (do not overwrite)
  - include post-setup guidance message: `Run /notes show note --global`
- Implementation targets:
  - new handler in `src/commands/handlers/setup.ts`
  - storage helper methods in `src/core/storage.ts` and/or formatter helper
  - handler registration in `src/commands/handlers/index.ts`
- Validation:
  - setup idempotency tests
  - starter note presence/content tests
- Evidence:
  - `docs/plans/completed/2026-04-05-notes-workflow-expansion/evidence/t-1002-setup-behavior.md`

## T-1003 — Implement explicit help aliases
- Status: done
- Story: 1
- Goal: Improve command discoverability with explicit help/list commands.
- Scope:
  - add `/notes help`
  - add `/notes commands` alias
  - keep `/notes` no-subcommand behavior
- Implementation targets:
  - `src/commands/handlers/help.ts`
  - `src/commands/notes.ts`
  - `src/commands/shared.ts`
- Validation:
  - command tests for all help entry points
- Evidence:
  - `docs/plans/completed/2026-04-05-notes-workflow-expansion/evidence/t-1003-help-surface.md`

## T-1004 — Implement markdown-preserving `/notes edit`
- Status: done
- Story: 2
- Goal: Support rich markdown edits via editor workflow.
- Scope:
  - add `/notes edit <name> [--project|--global]`
  - open note in editor, write on confirm/save, no-op on cancel
  - keep timestamp policy consistent with current writes
- Implementation targets:
  - `src/commands/handlers/edit.ts`
  - `src/core/storage.ts`
  - optional UI rendering updates if needed
- Validation:
  - tests for multi-line markdown preservation
  - tests for cancel/no-op behavior
- Evidence:
  - `docs/plans/completed/2026-04-05-notes-workflow-expansion/evidence/t-1004-edit-flow.md`

## T-1005 — Implement `/notes move` between scopes
- Status: done
- Story: 3
- Goal: Move notes across project/global stores safely.
- Scope:
  - implement `/notes move <name> --to-global|--to-project`
  - deterministic collision error by default
  - optional `--overwrite` behavior with explicit consent
- Implementation targets:
  - `src/commands/handlers/move.ts`
  - storage move helpers in `src/core/storage.ts`
- Validation:
  - tests for project->global and global->project moves
  - collision and overwrite path tests
- Evidence:
  - `docs/plans/completed/2026-04-05-notes-workflow-expansion/evidence/t-1005-move-matrix.md`

## T-1006 — Implement `/notes uninstall` cleanup flow
- Status: done
- Story: 3
- Goal: Add explicit cleanup command for project/global note directories.
- Scope:
  - `/notes uninstall` defaults to project-only target
  - flags: `--project`, `--global`, or both
  - confirm-gated destructive behavior
  - refuse destructive execution when `ctx.hasUI === false`
- Implementation targets:
  - `src/commands/handlers/uninstall.ts`
  - storage cleanup helpers in `src/core/storage.ts`
  - parser support and handler registration
- Validation:
  - tests for default scope, flag combinations, and no-UI refusal
- Evidence:
  - `docs/plans/completed/2026-04-05-notes-workflow-expansion/evidence/t-1006-uninstall-safety.md`

## T-1007 — Docs + release checklist + full validation
- Status: done
- Story: 4
- Goal: Keep docs and release checks aligned with new command contract.
- Scope:
  - update `README.md`, `docs/commands.md`, `docs/storage.md`, `docs/security.md`, `docs/release.md`
  - add smoke-test steps for setup/help/edit/move/uninstall
  - run full project validation gate
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - `docs/plans/completed/2026-04-05-notes-workflow-expansion/evidence/t-1007-docs-consistency.md`
