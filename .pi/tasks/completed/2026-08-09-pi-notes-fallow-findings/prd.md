# PRD: pi-notes Fallow findings remediation

## Problem

The follow-up Fallow audit found two error-level boundary violations caused by stale zone modeling, two low-volume clone groups in command/storage safety paths, and two moderate CRAP candidates whose coverage input is only a static estimate. Known clean categories must remain clean. The findings need proportionate remediation without metric-driven churn or changes to public notes behavior.

## Users

- Pi users relying on safe project/global note commands and tools.
- CLI users relying on deterministic edge-flag parsing and exit behavior.
- Maintainers relying on trustworthy Fallow boundary, duplication, and complexity reports.
- Reviewers verifying filesystem and destructive-flow invariants.

## Product requirements

1. Fallow boundary zones must model the package shim, Pi extension adapter, CLI adapter, commands, core, and UI according to implemented architecture.
2. Boundary scans must report zero unexplained violations and zero unmatched source files.
3. Rewrite/remove interactive preflight must use one typed command-layer path while keeping editor and destructive confirmation logic explicit, unless a concrete extraction is documented and reviewed as less auditable than the small existing duplication.
4. Create and non-overwrite destination writes must use one private exclusive no-follow primitive while preserving caller-specific conflict errors and handle cleanup.
5. The repository must provide repeatable measured V8 coverage compatible with Vitest 4 and Fallow.
6. Exact measured branch gaps must be tested before any complexity refactor is attempted.
7. `parseCliFlags` and `handleParsedNotesCommand` must be cleared, reduced, or explicitly accepted based on measured—not estimated—coverage evidence.
8. All original audit findings and clean categories must be reconciled with reproducible commands and ticket evidence.
9. Full repository quality and package dry-run checks must pass.

## Non-requirements

- New commands, tools, scope rules, overwrite behavior, or mode behavior.
- Broad storage decomposition based only on hotspot ranking.
- CI coverage thresholds, workflows, hooks, telemetry, baselines, publishing, tagging, or pushing.
- Inline suppressions as the default Fallow resolution.
- Committed `dist/` or coverage output.

## Success criteria

- Four ordered tickets have complete notes and evidence.
- Focused Fallow boundary output is clean and configuration matches current docs.
- Both original clone fingerprints are absent or have an explicit validator-reviewable disposition; required safety contracts remain tested.
- `npm run test:coverage` produces ignored JSON coverage and measured Fallow health evidence.
- No high/critical complexity findings or regressions in previously clean Fallow categories appear.
- Lint, typecheck, tests, build, package dry-run, task-plan validation, and focused lifecycle validation pass.
