# Implementation Plan — pi-notes Fallow findings

## Goal and outcome

Resolve the three linked Fallow audit areas with source-backed, repeatable evidence:

1. make the configured architecture policy match the intended Pi adapter architecture without broad suppressions;
2. remove or explicitly justify both reported duplication fingerprints while preserving command and filesystem contracts;
3. replace static estimated CRAP evidence with measured coverage, close exact branch gaps, and refactor only where measured risk remains.

The completed work should leave Fallow with zero unexplained boundary violations, no unreviewed copies of the two audited clone groups, and a measured complexity report that supports the final disposition of both moderate candidates.

## Scope

### In scope

- `.fallowrc.json` boundary-zone/rule corrections.
- Focused architecture documentation reconciliation when zone names or responsibilities change.
- Typed command-layer preflight extraction for rewrite/remove if it improves auditability.
- Private storage exclusive-write consolidation with preserved no-follow/exclusive semantics and exact conflict messages.
- Compatible Vitest V8 coverage tooling, a repeatable local coverage command, lockfile updates, and ignored generated coverage.
- Targeted branch tests for measured gaps in CLI flag parsing and command routing.
- Small adapter refactors only when measured coverage/CRAP evidence still supports them.
- Focused Fallow reruns and final audit reconciliation evidence.

### Non-goals

- No new `/notes`, `notes_*`, or CLI features.
- No changes to command grammar, scope precedence, overwrite handoffs, or mode behavior.
- No broad storage-module decomposition based only on hotspot ranking.
- No CI coverage gate, publishing/deployment changes, telemetry, hooks, or baseline enforcement.
- No inline Fallow suppressions used as the default resolution.
- No generated `dist/` or coverage artifacts committed.

## Assumptions and accepted risks

- `open-questions.md` contains no material questions.
- Adding the Vitest-compatible V8 coverage provider as a dev dependency is accepted because measured coverage is required to verify the audit; it must remain version-compatible with Vitest 4 and must not alter package runtime contents.
- A Fallow finding may close with an evidence-backed no-change decision when extraction demonstrably harms clarity or measured coverage clears the risk. Such a decision must be recorded in ticket evidence, not silently omitted.
- Fallow's static hotspot and ownership scores prioritize review but do not independently justify refactoring.
- Storage and destructive-flow safety take precedence over duplication reduction.

## Source and context for specification

### Task and audit

- `.pi/tasks/active/2026-08-09-pi-notes-fallow-findings/brainstorm.md`
- `.pi/tasks/active/2026-08-09-pi-notes-fallow-findings/open-questions.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/README.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/boundaries.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/duplication.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/complexity.md`

### Configuration and docs

- `.fallowrc.json`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `docs/architecture.md`
- `docs/agent-docs.yaml`
- `AGENTS.md`

### Implementation and tests

- `src/index.ts`
- `src/cli.ts`
- `src/commands/notes.ts`
- `src/commands/shared.ts`
- `src/commands/handlers/rewrite.ts`
- `src/commands/handlers/rm.ts`
- `src/commands/handlers/types.ts`
- `src/core/storage.ts`
- `tests/cli.test.ts`
- `tests/commands.test.ts`
- `tests/storage.test.ts`
- `tests/package-resources.test.ts`

## Spec-ready chunks

## Chunk 1 — Encode truthful adapter boundaries

### Intended change

Replace the overloaded `entry` zone with narrowly named responsibilities, subject to confirming Fallow's first-match/zone resolution behavior:

- package shim: `extensions/**/*.ts`;
- Pi extension adapter: `src/index.ts`;
- CLI adapter: `src/cli.ts`;
- existing command, core, and UI zones.

Expected dependency directions:

- package shim may delegate to the Pi extension adapter;
- Pi extension adapter may import command routing and core host-integration services;
- CLI adapter may import command routing;
- commands may import commands/core/UI as currently documented;
- core remains core-only;
- UI remains UI-only with type-only core access.

Prefer policy-level verification over line suppressions. If service-level core restrictions are not expressible, allow `Pi extension adapter -> core` and document that host integration is the reason.

### Acceptance contract

- Focused boundary scan reports zero boundary and boundary-coverage violations.
- Package shim, extension adapter, CLI adapter, command, core, and UI files all match exactly one intended zone.
- Architecture and agent-doc paths/names describe the same dependency direction.
- No production code change is required solely to satisfy a stale policy.

### Suggested ticket evidence

- Before/after Fallow boundary JSON summaries.
- Resolved configuration output or boundary listing showing zone matches.
- Targeted review of `src/index.ts` imports against the documented adapter role.

## Chunk 2 — Consolidate audited duplication safely

### 2A. Interactive preflight

Create the smallest typed command-layer helper that can:

1. read a named note with the existing scope selection;
2. emit the exact missing-note warning and handled failure status;
3. require interactive UI using the existing context contract;
4. return a resolved note only when the caller may continue.

Use it from rewrite and remove while keeping editor and destructive confirmation logic explicit in each handler. If implementation proves less readable or weakens outcome typing, retain the duplicated flow and document the no-change decision with trace evidence.

### 2B. Exclusive no-follow writes

Create a narrow private storage primitive for non-overwrite exclusive creation. It must preserve:

- `O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW`;
- mode `0600`;
- complete write and guaranteed handle closure;
- caller-specific `EEXIST` domain messages;
- propagation of non-`EEXIST` failures.

Use it from `createNote()` and non-overwrite `writeDestination()`. Do not combine overwrite and exclusive-create paths.

### Acceptance contract

- Exact create and destination-conflict messages remain unchanged.
- Missing-note, no-UI, cancel, overwrite, race, symlink, and path-safety behavior remain unchanged.
- Original fingerprints `dup:944112bd` and `dup:d01b53c0` are absent or have a documented accepted disposition after trace review.
- Any remaining duplication is measured and consciously accepted rather than hidden.

### Suggested ticket evidence

- Focused command/storage tests.
- Before/after `fallow dupes` summary and both fingerprint traces.
- Source review confirming destructive confirmation remains in handler-local control flow.

## Chunk 3 — Establish measured coverage and close evidence gaps

### Coverage tooling

Add a Vitest-4-compatible V8 coverage provider and a repeatable package script that emits a Fallow-supported JSON report, preferably `coverage/coverage-final.json`, plus concise human output. Keep `coverage/` ignored and verify the dry-run package does not include coverage artifacts.

Do not add a numerical CI threshold in this task. The script is an evidence tool, not a new release gate.

### Baseline and branch work

Run measured coverage before restructuring and inspect exact branches for:

- `parseCliFlags` leading/trailing/repeated confirmation flags;
- mixed help/confirmation flags and interior literal tokens;
- usage and unknown-command routing;
- injected versus constructed storage/context options;
- handled `NotesError` versus unexpected-error propagation.

Add targeted deterministic tests for true gaps. Then run Fallow health with measured coverage.

### Conditional refactor gate

Only if measured CRAP remains above the configured threshold after targeted tests:

- simplify CLI edge-token handling with table/set-driven classification or a focused consumer that preserves edge-only semantics;
- simplify command storage/context construction with a small typed factory if optional-spread branching remains a measured risk.

Do not refactor `src/core/storage.ts` based solely on its hotspot score. Any future split requires separate invariant mapping and is outside this task unless a concrete measured function finding appears.

### Acceptance contract

- Coverage command is repeatable offline after `npm ci` and writes only ignored generated output.
- Ticket evidence records measured line/branch/function coverage and measured Fallow results.
- `parseCliFlags` and `handleParsedNotesCommand` are cleared, reduced, or explicitly accepted with measured branch evidence.
- No high or critical complexity findings are introduced.
- Package runtime peer/runtime contracts and packed file list remain stable except for intended version/lock metadata.

## Chunk 4 — Reconcile evidence and current-state docs

### Intended work

- Re-run all audit points, including clean categories, after implementation.
- Update `docs/architecture.md`, `docs/agent-docs.yaml`, `AGENTS.md`, or maintenance docs only where current behavior/configuration changed.
- Record each original audit finding's final disposition and any accepted residual.
- Keep user-facing command/storage docs unchanged unless verification discovers a real behavior mismatch.

### Acceptance contract

- Audit index can map every original finding to implementation or explicit no-change evidence.
- No unused exports/dependencies, cycles, feature flags, or configured security candidates are introduced.
- Boundary, duplicate, and measured-complexity results are reproducible with documented commands.

## Dependencies and ordering

1. **Boundary policy first** — independent, low-risk configuration correction that restores trustworthy Fallow output.
2. **Duplication second** — changes command/storage internals and must land before final coverage evidence.
3. **Coverage and complexity third** — baseline should be captured before optional complexity refactors; final measured run occurs after duplication work.
4. **Reconciliation last** — complete Fallow rerun, package inspection, and docs/evidence depend on all implementation slices.

Chunk 3 may add its coverage dependency/script before Chunk 2 solely to capture a pre-refactor baseline, but its final disposition remains after Chunk 2.

## Validation expectations

### Repository quality gate

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### Coverage and package checks

```bash
npm run test:coverage
npm pack --dry-run --json --ignore-scripts
```

The execution spec should use the final script name chosen in `package.json` and verify that coverage output is ignored and excluded from the tarball.

### Focused Fallow evidence

Every Fallow invocation must use `--format json --quiet 2>/dev/null` and append `|| true`.

```bash
npx fallow dead-code --boundary-violations --format json --quiet 2>/dev/null || true
npx fallow dupes --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:944112bd --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:d01b53c0 --format json --quiet 2>/dev/null || true
npx fallow health --complexity --hotspots --targets --coverage coverage/coverage-final.json --format json --quiet 2>/dev/null || true
npx fallow --format json --quiet 2>/dev/null || true
```

Also run focused tests after each code slice and `git diff --check` before handoff.

## Human review gates

1. **Plan/spec gate:** review this handoff before creating execution specs; no unresolved questions currently block specification.
2. **No-change disposition gate:** any decision not to extract an audited clone or refactor a measured complexity candidate must be explicit in ticket evidence and reviewed during validation.
3. **Dependency boundary:** coverage tooling may add only compatible development dependencies and scripts; any CI threshold, workflow, telemetry, hook, or external service requires separate human approval.
4. **Safety review:** changes to storage open flags, handle lifecycle, overwrite behavior, or destructive command ordering require focused evidence before merge.
5. **Release boundary:** do not publish, tag, or push as part of this task.

## Suggested execution ticket groups

The specification stage should create approximately four ordered tickets:

1. Correct architecture boundary zones and verify policy coverage.
2. Consolidate both duplication groups with contract-preserving tests or explicit trace-backed disposition.
3. Add measured coverage, close exact branch gaps, and apply only evidence-gated complexity refactors.
4. Run complete validation/Fallow reconciliation and update current-state maintenance docs/evidence.

Ticket boundaries should remain independently committable and should not mix release/publishing work with remediation.
