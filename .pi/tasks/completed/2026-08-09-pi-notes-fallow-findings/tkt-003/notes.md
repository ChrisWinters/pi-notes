# tkt-003 notes — Add measured coverage and resolve complexity gaps

Status: complete

## Scope

Added compatible measured coverage tooling, gathered baseline/final evidence, closed genuine public-routing gaps, and applied the measured refactor gate.

## Decisions and tradeoffs

- Added `@vitest/coverage-v8` 4.1.10 as a dev dependency compatible with Vitest 4.1.10 and a `test:coverage` script emitting text summary plus `coverage/coverage-final.json`.
- Baseline measured Fallow reported no functions above the CRAP/complexity thresholds. Both named static-estimate candidates therefore cleared without production refactoring.
- Inspected uncovered CLI branches. Remaining lines belong to interactive readline, default process I/O/cwd adapters, force-confirm fallbacks, and direct-entry execution; existing tests already cover edge-only/repeated flags, help precedence, literal interior tokens, force behavior, and direct-entry detection. No parser refactor was justified.
- Added public tests for empty/help/commands CLI routing, unknown command failure, and unexpected handler-error propagation. This materially improved command-router coverage.
- Kept storage intact; hotspot score alone did not justify decomposition.

## Follow-up notes

None.
