# Tickets: Audit Remediation

Status legend: `ready` | `in_progress` | `blocked` | `done`

## T-901 — Define option parsing contract and fix literal-flag bug
- Status: done
- Story: 1
- Goal: Ensure `--project`/`--global` are treated as options only where intended.
- Scope:
  - formalize parser rules (prefix-only, suffix-only, or `--` separator)
  - implement parser update in command layer
  - ensure literal flag-like tokens remain content in append/grep/rewrite
- Implementation targets:
  - parser extraction in `src/commands/*`
  - command handlers consuming structured parse output
  - regression tests in `tests/commands.test.ts`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - parser utility added: `src/commands/parser.ts`
  - command integration: `src/commands/notes.ts`
  - regression tests: `tests/parser.test.ts`, `tests/commands.test.ts`
  - behavior matrix: `docs/plans/active/2026-04-05-audit-remediation/evidence/t-901-parser-behavior-matrix.md`

## T-902 — Make note creation atomic
- Status: done
- Story: 2
- Goal: Remove check-then-write create race.
- Scope:
  - replace existence-check create flow with atomic create semantics
  - preserve user-facing duplicate-note error behavior
- Implementation targets:
  - `src/core/storage.ts`
  - storage tests for concurrent creation behavior
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - atomic create implementation in `src/core/storage.ts`
  - concurrent create test in `tests/storage.test.ts`
  - evidence log: `docs/plans/active/2026-04-05-audit-remediation/evidence/t-902-atomic-create.md`

## T-903 — Serialize per-note mutation paths
- Status: done
- Story: 2
- Goal: Prevent lost updates on concurrent append/write.
- Scope:
  - add per-note mutation queue/mutex
  - route append/write operations through serialized path
- Implementation targets:
  - storage mutation queue primitive in `src/core/storage.ts` (or dedicated helper)
  - tests simulating concurrent appends
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - mutation queue + write/append routing in `src/core/storage.ts`
  - concurrent append test in `tests/storage.test.ts`
  - evidence log: `docs/plans/active/2026-04-05-audit-remediation/evidence/t-903-mutation-serialization.md`

## T-904 — Expand regression and reliability tests
- Status: done
- Story: 3
- Goal: Ensure bug/race scenarios remain fixed.
- Scope:
  - parser regression tests
  - create race tests
  - append race tests
  - maintain existing coverage
- Implementation targets:
  - `tests/commands.test.ts`
  - `tests/storage.test.ts`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
  - ✅ full suite green with targeted regressions exercised
- Evidence:
  - command/parser regression additions in `tests/commands.test.ts`
  - race reliability additions in `tests/storage.test.ts`
  - evidence log: `docs/plans/active/2026-04-05-audit-remediation/evidence/t-904-regression-reliability-tests.md`

## T-905 — Refactor command router for maintainability
- Status: done
- Story: 4
- Goal: Reduce complexity and improve extensibility.
- Scope:
  - split monolithic command file into parser + per-subcommand handlers
  - preserve behavior and error messages unless explicitly changed
- Implementation targets:
  - `src/commands/notes.ts` (thin router)
  - `src/commands/handlers/*.ts`
  - `src/commands/parser.ts`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
  - ✅ command behavior preserved with existing/expanded tests passing
- Evidence:
  - thin router + handler split under `src/commands/`
  - evidence log: `docs/plans/active/2026-04-05-audit-remediation/evidence/t-905-command-refactor.md`

## T-906 — Update docs for parser/race-safety changes
- Status: done
- Story: 5
- Goal: Keep public and internal docs accurate.
- Scope:
  - update README + docs/commands/storage/security/release
  - document parsing semantics and concurrency guarantees
  - add release checklist assertions for new regressions
- Implementation targets:
  - `README.md`
  - `docs/commands.md`
  - `docs/storage.md`
  - `docs/security.md`
  - `docs/release.md`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
  - ✅ docs reviewed against implementation and tests
- Evidence:
  - docs updates in README + docs pages
  - checklist: `docs/plans/active/2026-04-05-audit-remediation/evidence/t-906-docs-consistency-checklist.md`
