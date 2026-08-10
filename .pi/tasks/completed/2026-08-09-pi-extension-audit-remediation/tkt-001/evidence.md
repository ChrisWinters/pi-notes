# tkt-001 evidence

Status: complete

## Focused validation

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run test -- --run tests/storage.test.ts` — PASS, 26 tests.

## Regression and repository validation

- `npm run test` — PASS, 8 files / 100 tests.
- `npm run build` — PASS.
- Former exploit shape is covered in both scopes: a `.md` symlink is rejected on read/append and its external target remains byte-for-byte unchanged.
- Directory, overwrite destination, setup starter, and uninstall symlink fixtures all reject without changing external targets.
- Custom config-directory test proves project resolution and invalid override rejection.

## Fallow

- `fallow` was not installed (`command -v fallow` produced no path), so the optional local audit could not run. No installation or network mutation was attempted.

## Commit

This evidence is included with the ticket slice committed as `fix(storage): reject symlinked note paths`.
