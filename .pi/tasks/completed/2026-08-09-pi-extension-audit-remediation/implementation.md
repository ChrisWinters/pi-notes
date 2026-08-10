# Implementation plan: Pi extension audit remediation

## Goal and outcome

Bring pi-notes into alignment with the 2026-08-09 Pi extension audit by enforcing a real filesystem boundary, coordinating mutations with Pi, honoring cancellation, making tool/mode contracts truthful, aligning package and release metadata, and adding evidence-backed regression coverage and documentation.

The completed work should preserve the existing human-first notes UX and project-first/global-fallback behavior while removing unsafe or misleading edge behavior.

## Scope

- Reject symlinked config/storage directory components and note entries for all project/global note reads and mutations.
- Enforce canonical containment and regular-file/directory expectations within mutation windows.
- Parameterize storage config-directory resolution so extension mode uses Pi's `CONFIG_DIR_NAME`; preserve `.pi` as standalone CLI default with a narrowly validated explicit override if introduced.
- Introduce a mutation coordination abstraction that allows extension tools to use Pi's `withFileMutationQueue()` and CLI/core flows to retain local serialization without deadlocks.
- Thread `AbortSignal` through tool, command, queue, scan, and mutation boundaries.
- Replace notification-severity inference with typed command outcomes suitable for TUI/RPC, CLI, and agent tools.
- Remove agent-tool overwrite parameters and provide exact interactive conflict handoffs.
- Preserve complete truncated tool output in secure owner-only OS temporary artifacts with bounded retention and structured metadata.
- Define observable `/notes` behavior in print/JSON through a safe Pi API prototype, with an observable unsupported result and CLI handoff as fallback.
- Align Pi bundled-core peer dependency metadata and npm tarball tests.
- Correct CI/publish trigger and reproducibility behavior without publishing.
- Update public docs, skill guidance, changelog, tests, and generated build output.

## Non-goals

- Publishing or pushing a package.
- Adding agent-side destructive overwrite authorization.
- Supporting symlinked notes roots or note files, even when targets remain inside the root.
- Guaranteeing serialization across separate standalone CLI processes unless a later explicit requirement adds filesystem locking.
- Redesigning note format, naming, scope precedence, or the command family beyond audited contract changes.
- Introducing pagination as the first truncation fix.
- Broad CI or release-system redesign unrelated to the audited trigger/install corrections.

## Confirmed decisions

- Reject all relevant symlinks rather than support contained symlinks.
- Remove `overwrite` from `notes_move` and `notes_rename`; hand conflicts to interactive slash commands.
- Prefer mode-safe observable print/JSON command results; use an observable unsupported result plus CLI handoff if the Pi API cannot safely provide output.
- Extension mode uses `CONFIG_DIR_NAME`; standalone CLI defaults to `.pi` and only gains a narrowly validated explicit override.
- Full truncated output uses owner-only OS temp storage with bounded retention sufficient for current-session follow-up reads.
- Publish uses `release.published` and protected `workflow_dispatch`, tag/version verification, and a protected environment when repository configuration supports it.

## Assumptions and remaining risks

- `withFileMutationQueue()` is available from the supported coding-agent API and can be injected without requiring it in standalone CLI execution.
- A strict symlink rejection policy may intentionally break users who linked notes storage; this is an accepted security tradeoff and must be documented.
- Cross-process CLI races remain a documented limit.
- The exact temporary-file cleanup mechanism is an implementation choice, but it must be bounded, owner-only, and usable for a follow-up read.
- Print/JSON behavior requires a small prototype against current Pi APIs before implementation is fixed. The fallback decision rule is already approved, so this is technical discovery rather than a product question.
- GitHub protected environments and trusted-publisher settings are partly external. Repository files should declare the intended environment/trigger; external configuration must be documented as manual verification.
- Security checks must minimize time-of-check/time-of-use gaps. If portable Node APIs cannot provide complete race resistance for a specific operation, implementation must fail closed and record the residual limitation rather than overstate safety.

## Source and context files for spec creation

### Task and audit context

- `.pi/tasks/active/2026-08-09-pi-extension-audit-remediation/brainstorm.md`
- `.pi/tasks/active/2026-08-09-pi-extension-audit-remediation/open-questions.md`
- `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/README.md` and all linked finding files

### Implementation

- `src/core/storage.ts`
- `src/core/naming.ts`
- `src/core/errors.ts`
- `src/commands/context.ts`
- `src/commands/notes.ts`
- `src/commands/shared.ts`
- `src/commands/handlers/*`
- `src/index.ts`
- `src/cli.ts`
- `extensions/pi-notes/index.ts`

### Package, docs, and operations

- `package.json`
- `package-lock.json`
- `skills/pi-notes/SKILL.md`
- `README.md`
- `docs/README.md`
- `docs/architecture.md`
- `docs/commands.md`
- `docs/security.md`
- `docs/storage.md`
- `docs/release.md`
- `CHANGELOG.md`
- `.github/workflows/ci.yml`
- `.github/workflows/publish.yml`

### Tests

- `tests/storage.test.ts`
- `tests/commands.test.ts`
- `tests/tools.test.ts`
- `tests/cli.test.ts`
- `tests/package-resources.test.ts`
- any new focused integration fixtures/tests justified by the spec

### Upstream Pi references

- Current Pi `docs/extensions.md`, especially custom tools, output truncation, file mutation queueing, cancellation, config paths, error signaling, and mode behavior
- Current Pi `docs/packages.md`, especially bundled-core peer dependencies
- Current Pi `docs/rpc.md`, `docs/json.md`, and `docs/development.md`
- Current examples `examples/extensions/truncated-tool.ts` and relevant minimal tool examples

## Spec-ready implementation chunks

### Chunk 1 — Filesystem boundary and configurable roots

Define and enforce storage-root invariants before expanding other mutation behavior.

- Add validated config-directory/root inputs to storage rather than embedding `.pi`.
- Use `CONFIG_DIR_NAME` from the extension adapter; retain `.pi` CLI default and decide the minimal validated override syntax during specification.
- Reject symlinked directory components and note entries for reads, writes, setup, move, rename, delete, and uninstall.
- Require expected regular-file/regular-directory types.
- Recheck canonical containment and entry type in the protected operation window.
- Add deterministic tests for file/directory/broken/destination symlinks and both scopes.

**Outcome:** no note surface follows planted symlinks outside or inside storage, and roots are host-config aware.

### Chunk 2 — Mutation coordination and cancellation

Build coordination on top of the safe path model.

- Introduce an injectable mutation coordinator with deterministic multi-key ordering.
- Compose extension mutations with Pi's `withFileMutationQueue()` across the complete read-modify-write window.
- Retain a local coordinator for CLI/internal calls; avoid inconsistent nested acquisition order.
- Thread `AbortSignal` through tool and operation contexts.
- Check cancellation before acquisition, after waiting, between scan phases, and before mutation commits while preserving atomic consistency.
- Test built-in/shared queue coordination where feasible, competing multi-path operations, alias identity, pre-abort, queue-wait abort, and scan abort.

**Outcome:** parallel Pi mutations coordinate correctly, and aborted work does not begin a later mutation.

### Chunk 3 — Typed command outcomes and safe tool contracts

Separate domain outcomes from presentation.

- Define typed success/not-found/invalid/blocked/cancelled outcomes or an equivalent explicit result model.
- Adapt outcomes to TUI/RPC notifications, CLI stdout/stderr/exit status, and tool throws.
- Preserve successful empty list/no-match search behavior.
- Make missing targets and blocked requested tool mutations produce Pi `isError` semantics.
- Remove overwrite from `notes_move`/`notes_rename` schemas and argv construction.
- Return exact interactive overwrite handoff commands on conflicts; update skill routing.
- Add command, CLI, and tool contract tests.

**Outcome:** every surface reports the same domain result through the conventions of that surface, and schemas contain no impossible parameters.

### Chunk 4 — Truncation recovery and mode behavior

Resolve large-output and headless observability together because both depend on output adapters.

- Prototype the smallest current-Pi mechanism for observable print/JSON extension-command output without TUI/RPC duplication or model-context pollution.
- Implement the approved preferred behavior when safe; otherwise implement an observable unsupported result with exact CLI handoff.
- Preserve RPC UI protocol behavior.
- Write full truncated output to secure owner-only OS temp artifacts with bounded cleanup/retention.
- Return structured truncation metadata and document line/byte limits in relevant tool descriptions.
- Test full-output recovery, permissions/placement, cleanup policy, print/JSON/RPC success and error paths, and no duplicate TUI/RPC notifications.

**Outcome:** headless commands never silently succeed, and truncated data remains safely recoverable.

### Chunk 5 — Package and release alignment

Correct distributable metadata and publication controls.

- Move TypeBox to `peerDependencies: { "typebox": "*" }` and retain a tested dev dependency.
- Change coding-agent peer range to `"*"` while retaining the tested dev version.
- Regenerate lockfile and revise package tests.
- Verify `npm pack --dry-run` contains extension source and compiled CLI resources without an unintended bundled core runtime.
- Change CI installation to `npm ci`.
- Replace release-branch publish trigger with `release.published` and protected `workflow_dispatch`.
- Add tag/package-version preflight and declare a protected environment if the repository's intended configuration name can be represented without guessing; otherwise document the required external setup as a human gate.
- Preserve provenance and least privileges.

**Outcome:** installed packages use host core APIs predictably, CI is reproducible, and publication requires an intentional release action.

### Chunk 6 — Documentation, changelog, and final contract reconciliation

Update docs only after behavior stabilizes.

- Reconcile README, architecture, commands, security, storage, release, bundled skill, and changelog.
- Remove stale `docs/plans/*` references from `docs/README.md`.
- Distinguish lexical validation, canonical containment, symlink rejection, Pi-wide/in-process coordination, and cross-process limits.
- Publish a clear mode matrix and conflict/destructive handoff contract.
- Document temp-artifact retention and rebranded config behavior.
- Ensure tests assert critical docs/workflow contracts without overfitting prose.

**Outcome:** documentation matches implementation and does not overclaim security, concurrency, or mode support.

## Dependencies and ordering

1. Chunk 1 leads because safe canonical identities/root configuration underpin queues, temp-path decisions, and docs.
2. Chunk 2 follows the path model and provides operation/cancellation context used by later adapters.
3. Chunk 3 establishes typed outcomes needed by mode handling and accurate tool errors.
4. Chunk 4 builds on typed output and cancellation behavior.
5. Chunk 5 is mostly independent after API import decisions are stable, but should finish before final package/docs verification.
6. Chunk 6 is last so public claims match proven behavior.

Tests should be added with each chunk rather than deferred entirely to Chunk 6. Generated `dist/` should be regenerated at coherent build checkpoints, with final reconciliation after all source changes.

## Validation expectations

### Required repository gate

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### Focused evidence

- Temporary-directory symlink exploit that previously printed `SYMLINK_TARGET_MUTATED` now fails closed and leaves the external target unchanged.
- Both project and global roots reject symlinked components and entries.
- Concurrent notes operations plus Pi shared mutation coordination preserve all accepted updates without deadlock.
- Pre-aborted and queue-wait-aborted tools make no mutation and surface cancellation correctly.
- Missing-note tools throw; empty list and no-match grep remain successful.
- Registered rename/move tool schemas contain no overwrite property and conflicts provide exact interactive commands.
- Large tool output is truncated, points to a readable owner-only temp artifact containing the complete result, and follows the documented cleanup policy.
- Offline print/JSON/RPC mode smoke tests demonstrate observable, non-duplicated outcomes without API credentials.
- Package tests and `npm pack --dry-run` confirm Pi core peer metadata and required resources.
- Workflow tests/static assertions confirm intentional triggers, tag/version preflight, provenance permissions, and `npm ci`.
- Docs and skill examples match actual command/tool schemas and mode behavior.

## Validator gap repair handoff

The validator-owned `gaps.md` adds a bounded repair cycle after the initial six chunks. Preserve the original contracts and reconcile the existing spec/tickets rather than creating a parallel task.

### Repair chunk A — Stable mutation identities and strict uninstall scan

- For append/delete/move/rename, derive the complete candidate key set from the explicit/default scope selection before acquisition.
- Acquire unique sorted candidate source and possible destination paths, then select/revalidate the actual winner only inside that window.
- Ensure the path mutated or removed is always one of the acquired keys.
- Before uninstall recursive removal, recursively inspect the regular notes tree with no-follow metadata inside the directory mutation window; reject symlinks and wrong entry types without changing any entry.
- Add race tests that change the default-scope winner while acquisition is waiting and assert every actual path was acquired.
- Add both-scope inner symlink/broken-link uninstall tests with external targets unchanged.

### Repair chunk B — Truly bounded output and active artifact expiration

- Build the recovery notice first and reserve enough bytes/lines so the complete returned text, including artifact path, stays at or below Pi's limits.
- Schedule deletion for each newly created artifact at its deadline while the host remains alive; make timers non-blocking for process shutdown.
- Export/run stale artifact cleanup during extension registration as well as before artifact creation, so a later non-truncating startup reclaims expired output.
- Document that a stopped host cannot execute its timer and cleanup resumes on later startup or OS temporary cleanup; do not claim guaranteed wall-clock deletion while no process runs.
- Test complete result byte/line bounds, deadline-triggered deletion with fake timers or an injected short retention, and registration/startup cleanup.

### Repair chunk C — Complete validation matrix

- Add broken note-entry symlink coverage, list/grep scan-phase abort with deterministic hooks/coordinator timing, a Pi-style shared queue spy/race over the complete operation, and TUI adapter success/error/no-duplicate checks.
- Keep all mode checks offline and credential-free.
- Reconcile public docs and ticket evidence with repaired behavior and residual limitations.

### Repair ordering and validation

1. Stable locking and uninstall scanning first because tests depend on the corrected operation boundaries.
2. Output bounding/expiry second, independent of storage mutations.
3. Missing boundary evidence and docs reconciliation last.
4. Run focused tests per repair ticket, then lint, typecheck, full tests, build, npm dry-run, agent-docs validation, task-plan validation, and focused task validation.
5. Return to independent validator review; do not delete or rewrite validator-owned `gaps.md` during execution.

No new human review decision is required. If portable recursive scanning or active cleanup cannot satisfy these boundaries without a new daemon/privileged mechanism, stop and return that concrete limitation to validation rather than weakening the contract.

## Human review gates

No product questions remain before specification or execution. Stop for human input only if implementation discovery reveals one of these boundaries cannot be satisfied safely without changing a confirmed decision:

- current Pi APIs provide no observable print/JSON command channel and no safe observable unsupported channel;
- portable filesystem APIs cannot enforce the confirmed fail-closed symlink policy for a required operation;
- the protected GitHub environment name/policy cannot be derived from repository evidence and must be configured externally;
- temporary artifact retention requires a user-visible policy choice beyond the confirmed bounded/current-session constraint.

External GitHub/npm configuration and an actual publish remain human-operated post-code verification steps; they do not authorize publishing during this task.
