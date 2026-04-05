# T-1005 Move Matrix Evidence

Date: 2026-04-05
Ticket: `T-1005 — Implement /notes move between scopes`

## Implemented behavior

- Added `/notes move <name> --to-global|--to-project [--project|--global] [--overwrite]` handler.
- Added storage move primitive `NotesStorage.moveNote`.
- Move flags parsed via `moveSelection` from parser.
- Destination collision fails by default; `--overwrite` enables replacement.

## Behavior matrix

| Scenario | Expected | Status |
|---|---|---|
| Missing destination flag | explicit error | ✅ |
| Project -> global move | source removed, destination created | ✅ |
| Destination exists without overwrite | fail with clear message | ✅ |
| Move with `--overwrite` | destination replaced after confirmation | ✅ (handler + storage path implemented) |

## Test coverage

- `tests/parser.test.ts`
  - move flag parsing + conflicts + literal handling
- `tests/commands.test.ts`
  - `moves a note from project scope to global scope`
  - `requires explicit destination for move`
- `tests/storage.test.ts`
  - `moves notes across scopes and preserves markdown`
  - `fails move when destination exists and overwrite is disabled`

## Result

✅ Deterministic scope move flow implemented with explicit destination semantics.
