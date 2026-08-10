# tkt-003 evidence

Status: complete

## Validation

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run test -- --run tests/tools.test.ts tests/commands.test.ts tests/cli.test.ts` — PASS, 3 files / 52 tests.
- `npm run test` — PASS, 9 files / 107 tests.
- `npm run build` — PASS.

## Contract evidence

- Registered move/rename schemas assert no `properties.overwrite`.
- Missing `notes_show` now throws despite retaining warning-level interactive presentation.
- Rename conflict returns `/notes rename source target --project --overwrite`.
- CLI missing-show regression returns exit status 1.
- Existing list/grep tests remain successful for legitimate empty/no-match output.

## Fallow

- Optional fallow audit remains unavailable because the executable is not installed.

## Commit

This evidence is included with the ticket slice committed as `fix(tools): report truthful note outcomes`.
