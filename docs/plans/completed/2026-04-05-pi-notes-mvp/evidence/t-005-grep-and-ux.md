# T-005 Grep + UX Consistency Evidence

Date: 2026-04-05
Ticket: `T-005 — Implement deterministic /notes commands (part 2)`

## Delivered

- Implemented `/notes grep <query>` in `src/commands/notes.ts`
- Added search support in `src/core/storage.ts` via `grepNotes()`
- Added grep result rendering in `src/ui/render.ts`
- Standardized grep UX states:
  - missing query -> explicit error
  - no hits -> explicit no-match message
  - hits -> scope-tagged result list

## Scope behavior checks

| Scenario | Expected | Outcome |
|---|---|---|
| `grep <term> --project` with only global match | no-hit message | ✅ |
| `grep <term> --global` with global match | returns `[global]` match | ✅ |
| default grep with project match | returns `[project]` match | ✅ |

## Tests added/updated

- `tests/commands.test.ts`
  - grep hit case
  - grep no-hit case
  - grep invalid query case
  - grep scope-flag behavior

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
