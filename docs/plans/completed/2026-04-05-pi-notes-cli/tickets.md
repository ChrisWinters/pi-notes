# Tickets: pi-notes CLI Surface

Legend: `pending` | `ready` | `in_progress` | `blocked` | `done`

## T1 — Finalize CLI command grammar and flags

- **Status:** done
- **Goal:** Define initial CLI command set, scope flags, confirmation flags, and output/error conventions.
- **Artifacts:**
  - `prd.md`
  - `stories.md`
- **Evidence:** contracts documented in plan docs.

## T2 — Add CLI entrypoint and wiring

- **Status:** done
- **Goal:** Add `bin` entrypoint and command parser wiring.
- **Expected changes:**
  - `package.json` (`bin` mapping)
  - CLI bootstrap file in source tree
  - argument parsing + command dispatch
- **Validation:**
  - executable runs via local npm scripts / node path.
- **Evidence:**
  - Added `src/cli.ts` with `runCli()` + package `bin` mapping (`pi-notes` -> `dist/src/cli.js`).
  - Added `npm run cli` script and CLI tests (`tests/cli.test.ts`).

## T3 — Implement shared note service integration

- **Status:** done
- **Goal:** Ensure CLI operations use shared note service layer with extension commands to avoid drift.
- **Expected changes:**
  - shared service modules (if missing)
  - refactor command handlers to consume shared logic
- **Validation:**
  - behavior parity checks between CLI and extension flows.
- **Evidence:**
  - CLI uses `handleNotesCommandArgv()` and shared parser/handlers from `src/commands/notes.ts`.
  - Added parser argv test (`tests/parser.test.ts`) to verify shared parsing semantics.

## T4 — Implement confirmation + non-interactive safety

- **Status:** done
- **Goal:** Confirm-gate destructive operations and enforce safe non-interactive failure semantics.
- **Expected changes:**
  - confirm prompts or explicit force flag handling
  - clear errors when confirmation unavailable
- **Validation:**
  - tests for interactive/non-interactive branches.
- **Evidence:**
  - CLI supports `--yes` force-confirm for destructive operations.
  - Non-interactive destructive flow without `--yes` fails safely with explicit error.
  - Covered in `tests/cli.test.ts`.

## T5 — Update docs and examples

- **Status:** done
- **Goal:** Document CLI install/use, scope rules, and examples.
- **Expected changes:**
  - `README.md`
  - `docs/commands.md`
  - `docs/storage.md` or dedicated CLI section
- **Validation:**
  - docs match implementation contracts.
- **Evidence:**
  - Updated `README.md`, `docs/commands.md`, `docs/storage.md`, and `docs/architecture.md`.
  - Added rename command docs and CLI usage examples.

## T6 — Validation gate

- **Status:** done
- **Goal:** Run required repo validation checks before completion.
- **Validation commands:**
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
- **Evidence (2026-04-05):**
  - all four commands passed locally after implementation.
