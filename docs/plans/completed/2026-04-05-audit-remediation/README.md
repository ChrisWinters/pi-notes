# Plan: Audit Remediation

- Plan slug: `2026-04-05-audit-remediation`
- Status: completed
- Owner: Mr. Chris + agent support
- Created: 2026-04-05
- Completed: 2026-04-05
- Based on audit: `docs/plans/2026-04-05-audit/audit.md`

## Objective

Apply targeted remediation from the audit to harden correctness and reliability before broader release.

## Priority order

1. Fix confirmed scope-flag parsing bug.
2. Add race-safety primitives for create and mutation paths.
3. Add regression and concurrency-oriented tests.
4. Improve maintainability by decomposing command/router logic.

## Scope

- Command parser behavior for flags and literal content
- Storage atomicity and mutation serialization
- Test coverage for bug + race regressions
- Architectural refactor for command handler maintainability

## Out of Scope

- New user-facing note features unrelated to audit findings
- Advanced indexing/backlinks/digest features

## Success criteria

1. Literal `--project`/`--global` tokens in user content no longer alter scope unexpectedly.
2. `createNote` is atomic against concurrent create attempts.
3. Append/write mutation paths are serialized per note target.
4. Regression tests cover bug and race scenarios.
5. `src/commands/notes.ts` is split into clearer composable units.
6. Full quality gate remains green.

## Validation gate

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
