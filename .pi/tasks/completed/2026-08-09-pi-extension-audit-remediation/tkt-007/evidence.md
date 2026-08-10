# tkt-007 evidence

Status: complete

## Validation

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run test -- --run tests/storage.test.ts tests/mutation.test.ts tests/commands.test.ts tests/tools.test.ts` — PASS, 4 files / 72 tests.
- `npm run test` — PASS, 12 files / 122 tests.
- `npm run build` — PASS.

## Repair evidence

- Deterministic default-scope race fixture introduces a project winner only after acquisition begins, proves both project/global keys were supplied, mutates project, and leaves global unchanged.
- Project/global uninstall fixtures place internal symlinks beside a regular note; uninstall rejects, external content and the original note remain byte-for-byte unchanged.
- Existing directory/setup/overwrite symlink and cancellation suites remain green.

## Fallow

- Executable remains unavailable; optional audit skipped without installation.

## Commit

This evidence is included with `fix(storage): stabilize queued note identities`.
