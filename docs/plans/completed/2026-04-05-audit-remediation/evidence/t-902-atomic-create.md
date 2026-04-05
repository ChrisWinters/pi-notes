# T-902 Atomic Create Evidence

Date: 2026-04-05
Ticket: `T-902 — Make note creation atomic`

## Change summary

- Updated `createNote()` to use atomic file creation via `open(path, "wx")`.
- Removed race-prone check-then-write dependency for note creation.
- Preserved duplicate-note user error semantics (`Note already exists: <file>`).

## Why this fixes audit finding

Prior flow used `noteExists()` followed by `writeFile()`, which allowed TOCTOU races.
Current flow lets the OS enforce exclusivity on file creation.

## Test evidence

- Added concurrency-oriented storage test:
  - `tests/storage.test.ts` -> `creates a note atomically under concurrent create attempts`
- Verification behavior:
  - exactly one concurrent create succeeds
  - one concurrent create fails with `NotesError`
  - resulting note exists and is readable

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
