# tkt-004 evidence

Status: complete

## Focused validation

- `npm run test -- --run tests/tools.test.ts tests/output-artifact.test.ts tests/modes.test.ts` — PASS, 3 files / 17 tests.
- Initial mode-test attempts timed out because the child Pi process retained an open stdin pipe; the harness was corrected to close stdin explicitly and then completed in approximately 1.4 seconds.
- Tool regression verifies the bounded text excludes the tail while the owner-only artifact contains `line-2099`.
- Structured details assert truncation counts, artifact path, and 86,400,000 ms retention.
- Artifact tests assert `0600` file / `0700` directory modes on portable Unix and prove an expired artifact is removed on a later write.
- Real offline Pi print and JSON tests assert an observable stderr handoff; JSON stdout remains a valid session event.
- RPC adapter test asserts exactly one notification; headless adapter test asserts none before the observable throw.

## Repository validation

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run test` — PASS, 11 files / 113 tests.
- `npm run build` — PASS.
- `git diff --check` — PASS.

## Fallow

- `fallow` executable unavailable; optional analysis skipped without network/global installation.

## Commit

This evidence is included with the ticket slice committed as `fix(tools): retain truncated note output`.
