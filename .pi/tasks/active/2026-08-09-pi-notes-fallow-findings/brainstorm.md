# Brainstorm — pi-notes Fallow findings

## Original ask

> Use `/skill:task-brainstorm` to create a detailed brainstorm based on the audit findings at `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/README.md`. Start by reading all linked documents, update `brainstorm.md` in the order of the audit findings, and make a final pass to ensure all gaps are covered.

## Source evidence

Primary audit:

- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/README.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/boundaries.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/duplication.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/complexity.md`

Current contracts to preserve:

- `.fallowrc.json`
- `docs/architecture.md`
- `docs/agent-docs.yaml`
- `AGENTS.md`
- `src/index.ts`
- `src/cli.ts`
- `src/commands/notes.ts`
- `src/commands/handlers/rewrite.ts`
- `src/commands/handlers/rm.ts`
- `src/core/storage.ts`
- `tests/cli.test.ts`
- `tests/commands.test.ts`
- `tests/storage.test.ts`

## Intent

Resolve every reported Fallow finding with evidence, while keeping the extension small and preserving its filesystem, human-confirmation, cancellation, queueing, and public command/tool contracts. A finding may be closed by a focused code/config improvement or by measured evidence that proves no structural change is warranted; it must not be hidden with an unexplained suppression.

## 1. Architecture boundary configuration

### Problem

The configured `entry` zone groups the package shim, extension adapter, and CLI, then permits imports only from `entry` and `commands`. The implemented and documented extension adapter in `src/index.ts` necessarily imports `src/core/mutation.ts` and `src/core/output-artifact.ts`, producing two error-level boundary violations.

### Brainstormed direction

Model distinct adapter responsibilities instead of weakening every entrypoint:

- package shim: `extensions/**/*.ts`; may delegate to the extension adapter;
- extension adapter: `src/index.ts`; may use shared commands and the two core host-integration services;
- CLI adapter: `src/cli.ts`; may use shared commands;
- commands, core, and UI retain their existing directional rules.

Confirm Fallow's zone matching/order behavior before editing the configuration. Prefer explicit narrow zones and imports over inline suppressions. If Fallow cannot express service-level core access, allowing extension-adapter to core is still truthful and narrower than broad `entry -> core` access.

### Acceptance ideas

- The boundary command reports zero unexplained violations and zero coverage violations.
- Deliberately invalid imports remain rejected by configuration-level or fixture-based evidence where practical.
- `docs/architecture.md` and `docs/agent-docs.yaml` remain aligned with the encoded policy.

## 2. Duplication

### 2.1 Interactive note preflight

Rewrite and remove duplicate note lookup, missing-note warning, and UI-required gating before diverging into editor versus confirmation flows.

Potential extraction:

- a typed command-layer helper that resolves an existing note and verifies interactive UI;
- returns the resolved note on success and a handled/empty outcome otherwise;
- preserves the exact warning, cancellation/failure status, and command-specific continuation behavior.

Avoid a generic callback abstraction that obscures destructive control flow. If the helper makes the handlers harder to audit, retain the duplication and document the evidence-backed decision; however, the preferred experiment is a small typed resolver because future interactive handlers could otherwise drift.

### 2.2 Exclusive no-follow writes

`createNote()` and non-overwrite `writeDestination()` repeat exclusive `O_EXCL | O_NOFOLLOW` creation, `0600` mode, write, `EEXIST` mapping, and handle cleanup.

Potential extraction:

- a private storage primitive accepting destination path, Markdown, and conflict-message context;
- preserve exact domain messages for create versus move/rename destination conflicts;
- preserve no-follow flags, exclusive creation, owner-only mode, and guaranteed handle closure;
- keep overwrite behavior separate because it has different validation and creation semantics.

### Acceptance ideas

- Re-run Fallow duplication and trace both original fingerprints.
- Existing confirmation, missing-note, symlink, race, overwrite, and atomic-write tests remain green.
- Add focused tests only where extraction creates a new branch or error mapping contract.
- Do not optimize for zero duplication percentage at the cost of clarity or safety.

## 3. Complexity and measured coverage

### Problem

Fallow reports moderate CRAP candidates for `parseCliFlags` and `handleParsedNotesCommand`, but both scores use static estimated coverage. Existing tests already exercise many paths, so structural work without measured evidence could be counterproductive. `src/core/storage.ts` is the highest churn/complexity hotspot but has no function-level threshold breach and extensive safety tests.

### Evidence-first direction

1. Add or invoke compatible Vitest V8 coverage support and produce machine-readable measured coverage. Keep this local/repository-scoped; do not add a CI threshold or publishing behavior without separate evidence.
2. Feed the resulting coverage report to Fallow health and compare measured CRAP/coverage findings with the static estimate.
3. Identify exact uncovered branches in:
   - CLI leading/trailing/repeated `--yes` and help processing;
   - command usage and unknown-command paths;
   - optional storage/context construction;
   - handled `NotesError` and passthrough unexpected-error paths.
4. Add targeted branch tests before refactoring.
5. Refactor only if measured risk remains:
   - use table/set-driven flag classification or a focused edge-token consumer for CLI parsing;
   - use a small storage/context factory for command routing if optional construction branches remain noisy;
   - do not decompose storage merely because it is a hotspot. Any storage split must preserve complete mutation windows and containment checks.

### Coverage-tooling boundary

A compatible coverage provider may require a new dev dependency and lockfile update. Keep versions aligned with Vitest 4. Produce `coverage-final.json` or another Fallow-supported format, keep generated coverage ignored, and document a repeatable script only if it provides ongoing maintenance value.

### Acceptance ideas

- Measured coverage, not static estimation, is recorded in ticket evidence.
- The two original Fallow complexity candidates are either cleared, reduced with targeted changes, or explicitly accepted with measured branch evidence.
- No new high/critical complexity findings or refactoring targets are introduced.
- Storage hotspot handling is evidence-driven and does not weaken safety invariants.

## Cross-cutting constraints

- Do not change `/notes`, `notes_*`, CLI grammar, scope precedence, overwrite handoffs, or mode behavior unintentionally.
- Keep destructive/editor operations human-gated.
- Preserve symlink rejection, canonical containment, no-follow opens, owner-only files, queue acquisition, and cancellation boundaries.
- Do not claim cross-process CLI serialization.
- Do not hand-edit `dist/` or commit generated coverage output.
- Do not add publishing, pushing, deployment, telemetry, hooks, or CI gates as part of this remediation.
- Use deterministic offline tests and temporary HOME/project roots.
- Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before handoff.
- Re-run the focused Fallow boundary, duplication/trace, and measured-complexity commands using JSON quiet mode.

## Suggested work slices

1. Correct and verify the architecture boundary model.
2. Consolidate command preflight and exclusive-write duplication with contract tests, or record a source-backed no-change decision for any extraction that reduces clarity.
3. Establish measured coverage, close exact branch gaps, and perform only justified complexity refactors.
4. Re-run the complete Fallow audit points and reconcile docs/evidence.

## Risks

- A broad boundary allow rule could make the architecture check meaningless.
- Helper extraction in destructive handlers could hide confirmation ordering or status propagation.
- Storage deduplication could weaken no-follow/exclusive semantics or alter conflict messages.
- Coverage-driven refactoring could churn stable adapters for a metric rather than user value.
- Adding coverage tooling could create dependency or lockfile noise; versions must remain compatible and package contents unchanged.

## Final coverage pass

All audit findings are represented in source order:

1. boundary configuration has a narrow policy repair and verification path;
2. both duplication fingerprints have separate remediation/acceptance paths;
3. both moderate complexity candidates, hotspot context, and the static-versus-measured coverage gap have an evidence-first path.

Clean audit categories require no work unless regressions appear during final reruns. No material product or safety decision remains open for planning.
