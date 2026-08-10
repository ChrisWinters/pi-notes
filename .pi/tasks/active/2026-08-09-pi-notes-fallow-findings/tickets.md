# Tickets: pi-notes Fallow findings remediation

Execute in numeric order. `tkt-004` depends on all prior tickets and owns final reconciliation.

## [x] tkt-001 — Correct adapter boundary zones

### Scope

- Confirm installed Fallow zone matching and resolved-boundary output.
- Replace the overloaded `entry` zone with distinct package-shim, Pi-extension-adapter, and CLI-adapter zones.
- Preserve commands/core/UI direction rules and full source coverage.
- Update architecture/agent docs only where zone responsibilities become a current maintenance contract.

### Acceptance criteria

- Package shim may delegate to the Pi extension adapter.
- Pi extension adapter may use command and core host-integration services.
- CLI adapter may use command routing but does not receive unnecessary core access.
- Every source file matches the intended zone.
- Boundary and coverage violation counts are zero without inline suppressions.

### Focused validation

```bash
npx fallow config --format json --quiet 2>/dev/null || true
npx fallow list --boundaries --format json --quiet 2>/dev/null || true
npx fallow dead-code --boundary-violations --format json --quiet 2>/dev/null || true
npm run lint
```

## [ ] tkt-002 — Consolidate audited command and storage clones

### Dependencies

Requires `tkt-001` complete.

### Scope

- Implement or concretely evaluate a typed command helper for lookup, missing-note warning, and interactive-UI gating.
- Prefer using it from rewrite and remove while retaining operation-specific editor/confirmation flow; retain the original flow only with source/test/trace evidence that extraction is less auditable.
- Add a private storage primitive for non-overwrite exclusive no-follow writes.
- Use it from create and non-overwrite destination writing with caller-specific conflict messages.
- Add focused public-behavior tests where needed.

### Acceptance criteria

- Exact missing-note, no-UI, create-conflict, and destination-conflict behavior remains stable.
- Destructive confirmation and rewrite preview/apply ordering remain handler-local and tested.
- `O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW`, `0600`, full write, error propagation, and handle closure are preserved.
- Move/rename source removal remains after destination success.
- Both original clone fingerprints are absent, or any unavoidable residual has trace-backed ticket evidence and a validator review gate.

### Focused validation

```bash
npm run test -- tests/commands.test.ts tests/storage.test.ts
npm run lint
npm run typecheck
npx fallow dupes --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:944112bd --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:d01b53c0 --format json --quiet 2>/dev/null || true
```

### Review gate

Any change to destructive ordering, queue windows, open flags, file mode, conflict text, or source-after-success behavior blocks completion until focused evidence proves equivalence.

## [ ] tkt-003 — Add measured coverage and resolve complexity gaps

### Dependencies

Requires `tkt-002` complete.

### Scope

- Add a Vitest-4-compatible V8 coverage provider as a dev dependency and update the lockfile through npm.
- Add `test:coverage` to emit concise text and `coverage/coverage-final.json`.
- Confirm generated coverage remains ignored and unpackaged.
- Capture measured coverage for `parseCliFlags` and `handleParsedNotesCommand`.
- Add targeted tests for exact uncovered branches.
- Refactor adapters only if measured CRAP remains above threshold after tests.

### Acceptance criteria

- `npm run test:coverage` succeeds offline after dependency installation and emits Fallow-readable JSON.
- Package runtime peers/dependencies and packed resources remain unchanged except intended dev tooling/lock metadata.
- Evidence distinguishes baseline measured coverage, tests added, and final measured Fallow output.
- Both original moderate candidates are cleared, reduced, or explicitly accepted with measured evidence.
- No high/critical complexity finding is introduced and storage is not split solely for hotspot score.

### Focused validation

```bash
npm run test:coverage
npm run test -- tests/cli.test.ts tests/commands.test.ts
npm run lint
npm run typecheck
npx fallow health --complexity --complexity-breakdown --coverage coverage/coverage-final.json --format json --quiet 2>/dev/null || true
npm pack --dry-run --json --ignore-scripts
```

### Conditional implementation gate

Target tests first. Refactor CLI flag consumption or command-context construction only when the measured post-test report still exceeds configured CRAP thresholds and the change simplifies source without changing public behavior.

## [ ] tkt-004 — Reconcile Fallow and final project evidence

### Dependencies

Requires `tkt-001`, `tkt-002`, and `tkt-003` complete.

### Scope

- Re-run boundary, duplication/trace, measured health, dead-code/dependency, cycle, flag, and configured security scans.
- Map every original finding to implementation or explicit residual evidence.
- Reconcile current maintenance docs, agent docs, package script documentation, and audit references only where behavior/config changed.
- Run final repository, package, task, and generated-artifact checks.

### Acceptance criteria

- No unexplained boundary findings or unreviewed audited fingerprints remain.
- No unused exports/dependencies, cycles, flags, configured security candidates, or coverage artifacts are introduced.
- Measured coverage and complexity evidence is reproducible.
- Agent docs validation and dry-run package contents pass.
- All four tickets contain current notes/evidence, and no unresolved ticket/root gaps remain.

### Required final validation

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm pack --dry-run --json --ignore-scripts
npx fallow dead-code --unused-exports --unused-deps --unlisted-deps --circular-deps --re-export-cycles --boundary-violations --format json --quiet 2>/dev/null || true
npx fallow dupes --format json --quiet 2>/dev/null || true
npx fallow health --complexity --hotspots --targets --coverage coverage/coverage-final.json --format json --quiet 2>/dev/null || true
npx fallow flags --format json --quiet 2>/dev/null || true
npx fallow security --surface --format json --quiet 2>/dev/null || true
```

Run the agent-docs validator, `git diff --check`, focused task validation, and strict task-plan validation before handoff.

### Human review gate

Stop if a material new security/boundary finding appears, measured evidence requires out-of-scope architecture work, or package/coverage tooling would require CI, publishing, telemetry, hooks, or external-service changes.
