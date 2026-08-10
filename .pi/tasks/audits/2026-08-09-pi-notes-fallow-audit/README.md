# pi-notes Fallow Audit

- Audit date: 2026-08-09
- Tool: Fallow 3.14.0
- Scope: repository static code health and configured security candidates

## Findings

1. [Architecture boundaries](boundaries.md) — two configured error-level violations reflect a stale entry-zone policy rather than the documented adapter architecture.
2. [Duplication](duplication.md) — two low-volume clone groups in interactive preflight and exclusive file creation.
3. [Complexity](complexity.md) — two moderate CRAP-score candidates based on static estimated coverage, plus storage/command churn hotspots.

## Clean audit points

No finding files were created for clean categories. Fallow reported:

- no unused exports from the requested unused-export scan;
- no unused or unlisted dependencies;
- no circular dependencies or re-export cycles;
- no feature flags;
- no configured path-traversal or resource-amplification security candidates;
- no unmatched boundary-coverage files.

Runtime coverage was not supplied or requested, so this audit does not claim measured test or production coverage. Security output is candidate-oriented only; this run produced no candidates under the configured categories.

## Commands and handling

All Fallow commands used JSON quiet mode, discarded stderr, and tolerated issue exit codes as required. Follow-up clone traces and complexity contribution breakdowns were used to verify recommendations. No audited source, configuration, dependency, hook, telemetry, or generated file was changed.
