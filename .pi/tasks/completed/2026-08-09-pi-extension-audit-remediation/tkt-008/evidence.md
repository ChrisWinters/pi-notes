# tkt-008 evidence

Status: complete

## Validation

- `npm run lint` — PASS after correcting the non-truncated result reference found by the first focused run.
- `npm run typecheck` — PASS after the same bounded local correction.
- `npm run test -- --run tests/tools.test.ts tests/output-artifact.test.ts tests/package-resources.test.ts` — PASS, 3 files / 24 tests. The first run also caught the existing notice-colon contract; the bounded notice retained it.
- `npm run test` — PASS, 12 files / 124 tests.
- `npm run build` — PASS.
- `git diff --check` — PASS.

## Repair evidence

- Large show result asserts complete text line count is at most 2,000 and UTF-8 size at most 50KB while full artifact retains the tail.
- Short-retention artifact is absent after its live deadline.
- Registration removes a pre-aged stale artifact without requiring another truncating command.
- Existing later-write expiry and Unix `0600`/`0700` checks remain green.

## Fallow

- Executable remains unavailable; optional audit skipped without installation.

## Commit

This evidence is included with `fix(tools): bound and expire output artifacts`.
