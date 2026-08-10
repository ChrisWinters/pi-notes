# pi-notes Fallow Findings Remediation Specification

Status: Draft for spec coverage review
Owner/manager: Human-managed pi-tasks lifecycle
Last updated: 2026-08-09

Purpose: Resolve the follow-up Fallow boundary, duplication, and complexity findings with measured evidence while preserving pi-notes behavior and filesystem safety.

## Normative language

- **must / required**: mandatory for completion.
- **must not**: prohibited.
- **should / recommended**: expected unless ticket notes record a concrete reason to differ.
- **may / optional**: permitted but not required.
- **implementation-defined**: the executor must choose and record a behavior that satisfies this contract.

## 1. Problem statement

The 2026-08-09 follow-up Fallow audit identified three maintenance areas:

1. `.fallowrc.json` groups all runtime entry files into one `entry` zone that cannot import core, while the documented Pi adapter intentionally imports mutation and output-artifact services from core. Two error-level violations are policy noise rather than verified source defects.
2. Fallow reports an 18-line clone across rewrite/remove interactive preflight and a five-line clone across two exclusive no-follow storage writes. The duplicated behavior can drift, but consolidation must not hide destructive control flow or weaken filesystem invariants.
3. `parseCliFlags` and `handleParsedNotesCommand` exceed the CRAP threshold only under static estimated coverage. Existing tests cover many paths, so measured coverage must precede metric-driven refactoring.

Fallow reported no unused exports/dependencies, cycles, feature flags, configured security candidates, or unmatched boundary files. Those clean categories form regression constraints.

## 2. Goals

- Encode a narrow, truthful architecture policy with zero unexplained boundary/coverage findings.
- Consolidate audited command preflight without moving editor or destructive confirmation ownership out of handlers.
- Consolidate exclusive non-overwrite writes without changing flags, mode, errors, queue windows, or source-removal ordering.
- Add repeatable measured V8 coverage compatible with Vitest 4 and Fallow.
- Close exact measured branch gaps before considering adapter refactors.
- Produce reproducible ticket evidence for every original finding and clean category.
- Pass repository, package, lifecycle, and documentation validation.

## 3. Non-goals

- No new `/notes`, `notes_*`, or CLI capability.
- No command grammar, scope precedence, mode, overwrite-handoff, or output behavior change.
- No broad `NotesStorage` split based only on hotspot ranking.
- No CI coverage gate, workflow change, Fallow baseline, hook, telemetry, external service, publishing, tagging, pushing, or deployment.
- No broad ignore or inline suppression used to hide an original finding.
- No generated `dist/` or coverage output committed.
- No user-note migration or storage-format change.

## 4. Required source context

### Lifecycle and audit

- `.pi/tasks/active/2026-08-09-pi-notes-fallow-findings/brainstorm.md`
- `.pi/tasks/active/2026-08-09-pi-notes-fallow-findings/implementation.md`
- `.pi/tasks/active/2026-08-09-pi-notes-fallow-findings/open-questions.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/README.md`
- Linked `boundaries.md`, `duplication.md`, and `complexity.md`

### Configuration and package

- `.fallowrc.json`, `.gitignore`
- `package.json`, `package-lock.json`
- `AGENTS.md`
- `docs/architecture.md`, `docs/agent-docs.yaml`

### Runtime and tests

- `extensions/pi-notes/index.ts`, `src/index.ts`, `src/cli.ts`
- `src/commands/notes.ts`, `src/commands/shared.ts`
- `src/commands/handlers/{rewrite,rm,types}.ts`
- `src/core/storage.ts`
- `tests/{cli,commands,storage,package-resources}.test.ts`

No `.pi/PI_TASKS_SPEC_CONTEXT.md` exists; no project-specific spec requirements beyond repository evidence are assumed.

## 5. Current system contracts

### 5.1 Runtime adapters

- `extensions/pi-notes/index.ts` is the package shim and re-exports `src/index.ts`.
- `src/index.ts` is the Pi adapter. It registers `/notes` and `notes_*`, injects `CONFIG_DIR_NAME` and Pi's mutation queue, and coordinates private output artifacts.
- `src/cli.ts` is the standalone CLI adapter and invokes shared command routing with `.pi` compatibility defaults.
- `src/commands/**` owns grammar, outcomes, UI abstraction, and handlers.
- `src/core/**` owns storage, mutation coordination, output artifacts, names, formatting, and errors.
- `src/ui/**` renders command/tool text and uses core only for types where configured.

### 5.2 Interactive command flow

Rewrite and remove currently each:

1. validate required command arguments;
2. resolve a note through `NotesStorage.readNote()`;
3. emit `Note not found: <name>` at warning severity when absent;
4. call `requireHasUi()` and stop when UI is unavailable;
5. continue into operation-specific editor or confirmation behavior.

Rewrite owns editor proposal, preview, apply confirmation, timestamped write, and cancellation. Remove owns destructive confirmation, deletion, and cancellation. These operation-specific stages must remain explicit.

### 5.3 Exclusive storage flow

`createNote()` and non-overwrite `writeDestination()` each open a path with `O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW` and mode `0600`, write Markdown, map `EEXIST` to caller-specific `NotesError` text, and close the file handle in `finally`.

Move/rename acquire mutation identities before winner selection, validate destinations, write destination, then remove source. Consolidation must not move source removal into the write primitive or alter the consistency-critical boundary.

### 5.4 Complexity evidence

Fallow static estimation reports:

- `parseCliFlags`: cyclomatic 12, cognitive 12, estimated CRAP 43.1;
- `handleParsedNotesCommand`: cyclomatic 10, cognitive 10, estimated CRAP 31.6.

Neither exceeds cyclomatic or cognitive thresholds; only estimated CRAP exceeds 30. Existing tests provide substantial but unmeasured branch coverage.

## 6. Required target behavior

## 6.1 Architecture policy

The Fallow config must model at least these responsibilities as distinct zones:

| Zone responsibility | Required paths | Allowed project-zone dependencies |
| --- | --- | --- |
| Package shim | `extensions/**/*.ts` | Pi extension adapter |
| Pi extension adapter | `src/index.ts` | Pi extension adapter, commands, core |
| CLI adapter | `src/cli.ts` | CLI adapter, commands |
| Commands | `src/commands/**/*.ts` | commands, core, UI |
| Core | `src/core/**/*.ts` | core |
| UI | `src/ui/**/*.ts` | UI; type-only core access |

Exact zone names are implementation-defined. The executor must first verify installed Fallow zone matching and must ensure every source path matches the intended zone. The config must not grant CLI broad core access merely because the Pi adapter needs it.

Required output:

- zero `boundary_violations`;
- zero `boundary_coverage_violations`;
- no line-level suppression for the two original imports;
- docs that remain truthful about adapter/core integration.

## 6.2 Shared interactive preflight

A command-layer helper must own the common preflight. Its exact name and module are implementation-defined, but it must:

1. receive note name, storage, scope selection, and command context;
2. call `storage.readNote(name, scopeSelection)`;
3. when absent, call the existing failure/outcome path with exact text `Note not found: <name>` and warning severity, then return no note;
4. call `requireHasUi(ctx)` and return no note when false;
5. return the resolved `StoredNote` only when execution may proceed.

`handleRewrite` and `handleRm` must call the helper after their own argument validation. They must keep their editor/confirmation/cancellation/mutation logic local. The helper must not accept an opaque operation callback or perform a destructive action.

Tests must prove missing-note and no-UI behavior and preserve exact visible messages/outcome status. Existing confirmation counts and cancellation behavior must remain passing.

## 6.3 Shared exclusive-write primitive

A private `NotesStorage` primitive must own non-overwrite exclusive creation. It must accept enough context to preserve caller-specific conflict errors.

Required behavior:

- open with `O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW`;
- request file mode `0600`;
- write the complete Markdown as UTF-8;
- convert only `EEXIST` into the supplied/derived `NotesError` message;
- propagate every other error unchanged;
- close an opened handle in `finally` on success and failure;
- remain private and be tested through public storage operations.

`createNote()` must preserve `Note already exists: <fileName>`.

Non-overwrite move/rename destination writing must preserve `Destination already has note: <fileName>. Re-run with --overwrite.`.

Overwrite writing must remain a separate validated no-follow path. Move/rename queue acquisition and source removal must remain in callers; source removal must occur only after successful destination writing.

## 6.4 Coverage tooling

`package.json` must add:

- a Vitest-4-compatible `@vitest/coverage-v8` development dependency;
- a repeatable `test:coverage` script that runs the full suite and emits human-readable coverage plus JSON accepted by Fallow at `coverage/coverage-final.json`.

`package-lock.json` must be updated through npm. `coverage/` must remain ignored. No coverage file may appear in the dry-run package or Git status.

The tooling must not alter runtime `dependencies`, `peerDependencies`, Pi package metadata, CI workflows, or publish workflows.

## 6.5 Measured complexity workflow

Execution must follow this order:

1. run full measured coverage before complexity refactoring;
2. record line, branch, function, and statement coverage for `src/cli.ts` and `src/commands/notes.ts`;
3. inspect exact uncovered branches for edge flags, help precedence, usage/unknown command, optional storage construction, handled `NotesError`, and unexpected-error propagation;
4. add targeted public/API-level tests for genuine gaps;
5. rerun measured coverage and Fallow health using `coverage/coverage-final.json`;
6. refactor only if a named function still exceeds configured measured CRAP threshold 30.

If refactoring is required:

- CLI parsing may use table/set-driven edge-token classification or a focused token consumer, but edge-only semantics and literal interior tokens must remain unchanged.
- Command routing may use a small typed storage/options factory, but explicit outcome/error behavior must remain unchanged.
- Private functions must not be exported only for tests.

If measured evidence clears a candidate after tests, no production refactor is required. The evidence file must explicitly record that disposition.

`src/core/storage.ts` must not be split solely because it has the highest hotspot score. A new measured function-level finding outside the two named adapters is a review item, not automatic scope expansion.

## 6.6 Final Fallow reconciliation

The final ticket must rerun:

- unused export and dependency checks;
- circular and re-export cycle checks;
- boundary/coverage checks;
- duplication plus traces for both original fingerprints;
- measured complexity/hotspot/target analysis;
- feature flags;
- configured security surface/candidates.

Every command must use `--format json --quiet 2>/dev/null` and append `|| true`. Exit code 1 is finding output, not runtime failure. Security output remains unverified candidate evidence.

A material new boundary/security finding or required out-of-scope architecture change must stop execution and be recorded as a gap for human review.

## 7. Compatibility and safety

### Public compatibility

The following must remain unchanged:

- `/notes` and `notes_*` names and schemas;
- CLI arguments and edge-only option behavior;
- project/global default scope resolution;
- exact overwrite handoffs and conflict messages;
- TUI/RPC and print/JSON mode contracts;
- typed `success | failure | cancelled` outcomes.

### Filesystem invariants

The work must preserve:

- lexical name checks, symlink rejection, regular-path checks, and canonical containment;
- exclusive/no-follow creation and owner-only modes;
- complete coordinated read-modify-write windows;
- unique sorted multi-path queueing;
- cancellation before mutation and coherent move/rename completion after mutation begins.

### External boundaries

- Do not modify real `.pi/notes` or `~/.pi/notes` in tests.
- Do not enable Fallow hooks, telemetry, Impact, or baselines.
- Do not publish, tag, push, deploy, or change CI/release workflows.
- Do not commit temporary JSON analysis, coverage, tarballs, or generated `dist/`.

## 8. Failure model

| Failure class | Required behavior | Validation |
| --- | --- | --- |
| Invalid Fallow zone config | Fail ticket, inspect installed schema/resolved config, repair before proceeding | `fallow config` and boundary listing |
| Source file unmatched by zones | Treat as configuration failure; do not add broad ignore | Boundary coverage output |
| Missing note in shared preflight | Preserve warning text/status and stop before editor/confirm | Command tests |
| No interactive UI | Preserve existing failure and perform no editor/confirm/mutation | Command tests |
| Exclusive destination exists | Preserve caller-specific `NotesError`; do not remove source | Storage tests |
| Unexpected exclusive-write error | Propagate unchanged and close opened handle | Focused feasible public-path evidence plus source review |
| Coverage provider incompatible | Repair compatible dev version/lock; do not bypass measured evidence | `npm ci`/coverage command |
| Coverage JSON missing/unreadable | Ticket fails; do not use static estimate as completion evidence | File check and Fallow health output |
| Measured CRAP remains >30 | Add exact tests first, then apply bounded adapter refactor if still needed | Before/after coverage and Fallow evidence |
| New material security/boundary result | Verify as candidate, record gap, stop for human review if out of scope | Final Fallow evidence |

## 9. Execution sequence

1. **tkt-001 — Correct adapter boundary zones.** Independent configuration/docs slice.
2. **tkt-002 — Consolidate audited command/storage clones.** Depends on truthful boundary output.
3. **tkt-003 — Add measured coverage and resolve complexity gaps.** Depends on final duplicated-flow shape.
4. **tkt-004 — Reconcile Fallow and final project evidence.** Depends on all prior tickets.

Each ticket must update its own `notes.md` and `evidence.md`, run focused validation, and leave the repository coherent. Each implementation slice should be independently committed using repository style.

## 10. Validation matrix

| Requirement | Method | Expected evidence |
| --- | --- | --- |
| Truthful zone model | Fallow config/list/boundary scans | Intended six responsibilities; zero boundary/coverage violations |
| Interactive preflight equivalence | Command tests and source review | Exact missing/no-UI behavior; local editor/confirmation ownership |
| Exclusive-write safety | Storage tests and source review | Flags/mode/error/closure/source ordering preserved |
| Original clones resolved | Duplication scan and both traces | Fingerprints absent or explicit reviewed residual |
| Repeatable measured coverage | `npm run test:coverage` | Text summary and `coverage/coverage-final.json` |
| Coverage excluded | Git status, ignore check, package dry-run | No tracked/packed coverage artifacts |
| Complexity disposition | Measured Fallow health/breakdown | Named functions cleared/reduced/accepted with measured evidence |
| Public compatibility | Existing CLI/commands/tools/modes suites | All pass without changed public contracts |
| Clean categories preserved | Final Fallow scans | No new dead code/deps/cycles/flags/configured candidates |
| Project quality | lint/typecheck/test/build | All commands pass |
| Docs consistency | Agent-docs validator and review | Paths exist; architecture/scripts current |
| Lifecycle readiness | `task_plan_validate` and focused `task_validate` | Zero blocking warnings/errors |

## 11. Required commands

### Repository and package

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm pack --dry-run --json --ignore-scripts
git diff --check
```

### Fallow

```bash
npx fallow config --format json --quiet 2>/dev/null || true
npx fallow list --boundaries --format json --quiet 2>/dev/null || true
npx fallow dead-code --unused-exports --unused-deps --unlisted-deps --circular-deps --re-export-cycles --boundary-violations --format json --quiet 2>/dev/null || true
npx fallow dupes --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:944112bd --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:d01b53c0 --format json --quiet 2>/dev/null || true
npx fallow health --complexity --complexity-breakdown --hotspots --targets --coverage coverage/coverage-final.json --format json --quiet 2>/dev/null || true
npx fallow flags --format json --quiet 2>/dev/null || true
npx fallow security --surface --format json --quiet 2>/dev/null || true
```

If an original duplicate fingerprint no longer resolves, evidence must record that as expected resolution rather than treating the trace's empty/not-found result as a runtime failure.

## 12. Risks and mitigations

- **Over-broad zone access** — split adapters and verify exact matched zones before accepting clean counts.
- **Hidden destructive flow** — helper performs only lookup/UI gating; confirmation and mutation stay local.
- **Weakened storage creation** — one private primitive preserves explicit flags, mode, `finally`, and error context; public tests guard it.
- **Metric-driven churn** — measured coverage and tests precede refactoring; no storage split from hotspot score alone.
- **Dependency/package drift** — coverage provider remains development-only; lockfile, package-resource tests, and dry-run tarball are reviewed.
- **Generated artifact leakage** — retain `coverage/` ignore and inspect Git/package outputs.

## 13. Human review gates

- Any unavoidable residual of an original clone fingerprint requires explicit evidence and validator review.
- Any change to destructive ordering, queue windows, open flags, file mode, exact conflict text, or source-after-success behavior blocks the relevant ticket until equivalence is proven.
- Any material new security/boundary finding or out-of-scope architecture need stops execution for human review.
- CI thresholds, workflows, publishing, telemetry, hooks, or external services require separate approval and are prohibited here.

## 14. Definition of done

- [ ] All four tickets are checked complete in `tickets.md`.
- [ ] Every ticket has current `notes.md` and `evidence.md`.
- [ ] Fallow boundary and coverage violations are zero without suppressing original imports.
- [ ] Shared interactive preflight preserves messages, outcomes, and handler-local operation flow.
- [ ] Shared exclusive-write primitive preserves all filesystem and error invariants.
- [ ] Original duplicate fingerprints are absent or explicitly reviewed with evidence.
- [ ] `test:coverage` produces ignored Fallow-readable measured coverage.
- [ ] Both moderate complexity candidates have measured final dispositions.
- [ ] Previously clean Fallow categories remain clean or new findings are recorded as gaps.
- [ ] Lint, typecheck, tests, coverage, build, package dry-run, agent-docs, and diff checks pass.
- [ ] No generated coverage/dist artifact, publishing action, hook, telemetry, CI gate, or unrelated change is included.
- [ ] Task-plan and focused lifecycle validation pass with no unresolved gaps.

## 15. Open questions

No open questions.

## 16. References

- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/README.md`
- `.pi/tasks/active/2026-08-09-pi-notes-fallow-findings/brainstorm.md`
- `.pi/tasks/active/2026-08-09-pi-notes-fallow-findings/implementation.md`
- `.fallowrc.json`
- `docs/architecture.md`
- `docs/agent-docs.yaml`
