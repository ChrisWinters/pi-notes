# T-904 Regression & Reliability Test Expansion

Date: 2026-04-05
Ticket: `T-904 — Expand regression and reliability tests`

## Scope completed

- Parser regression coverage expanded.
- Create race coverage already present and retained.
- Append race coverage expanded to higher concurrency volume.

## Added/updated tests

### Command/parser regression

- `tests/commands.test.ts`
  - preserves literal `--global` token in append content
  - supports literal grep query token via `--` separator (`grep -- --global`)
  - preserves literal flag-like token in rewrite instruction
- `tests/parser.test.ts` (from T-901, retained in Story 3 validation set)

### Storage race reliability

- `tests/storage.test.ts`
  - atomic concurrent create test (retained)
  - concurrent append test for two writers (retained)
  - new higher-volume concurrent append test (`10` concurrent entries)

## Before/after notes

- Before remediation effort, parser bug and race risks were documented in audit.
- After Story 1 + Story 2 + Story 3 coverage expansion:
  - parser bug behavior is covered by explicit regressions
  - create race behavior is covered by concurrent create assertion
  - append lost-update risk is covered with low and higher concurrency append tests

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅

## Current suite snapshot

- Test files: 5
- Total tests: 38
