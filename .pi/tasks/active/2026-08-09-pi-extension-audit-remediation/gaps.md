# Validation Gaps

Active task: `.pi/tasks/active/2026-08-09-pi-extension-audit-remediation/`
Review date: 2026-08-10

## Summary

- Result: gaps-found
- Gap count: 4
- Recommended next step: agent-managed repair through task-brainstorm/task-plan/task-spec/task-executor, then independent revalidation

## Review Scope

- Task contracts reviewed: `README.md`, `spec.md`, `prd.md`, `stories.md`, `tickets.md`, `implementation.md`, `brainstorm.md`, `open-questions.md`, and `spec-check.md`.
- Ticket evidence reviewed: every `tkt-001` through `tkt-006` `notes.md` and `evidence.md`.
- Source/context reviewed: `src/core/storage.ts`, `src/core/mutation.ts`, `src/core/output-artifact.ts`, `src/index.ts`, command adapters, package/workflow metadata, public docs, skill guidance, and boundary tests.
- Independent checks: lint, typecheck, 119 tests, build, agent-docs validation, and npm dry-run package inspection passed.
- Fallow: unavailable locally (`fallow` executable not installed), consistent with ticket evidence; no network/global installation was attempted.

## Findings

### GAP-001 — Truncated tool results exceed the configured byte/line envelope and cleanup is not time-bounded

Type: incorrect-behavior

Expected:
- `spec.md` section 8.1 requires tool output to remain bounded by Pi's line/byte limits and full artifacts to have bounded retention that does not retain indefinitely.

Observed:
- `src/index.ts` applies `truncateHead()` at the full 2,000-line/50KB limit, then appends an unbounded notice/path, so the returned model-visible text can exceed the configured maximum.
- `src/core/output-artifact.ts` deletes expired artifacts only when another artifact is written. If no later truncation occurs, a file remains after the advertised 24-hour retention; docs and descriptions state it is retained for 24 hours.
- `tests/tools.test.ts` checks the truncation structure but not final returned line/byte bounds. `tests/output-artifact.test.ts` proves only cleanup triggered by a later write.

Why it matters:
- ST-004 promises bounded model context and truthful finite retention for private note content.

Context files:
- `spec.md` section 8.1
- `stories.md` ST-004
- `src/index.ts`
- `src/core/output-artifact.ts`
- `tests/tools.test.ts`
- `tests/output-artifact.test.ts`

Suggested follow-up:
- Reserve room for a deterministic recovery notice (or re-bound the final result) and assert final line/byte limits.
- Add expiration scheduling plus startup/opportunistic cleanup so artifacts are removed at the deadline while the host is alive and stale artifacts are reclaimed on later extension startup; document the precise process/OS residual behavior rather than claiming exact deletion when the host cannot run cleanup.

### GAP-002 — Default-scope mutations can acquire a stale source identity

Type: incorrect-behavior

Expected:
- `spec.md` sections 5.2 and 6 require canonical/type checks and the complete read-modify-write operation to occur under the protected queue for every actual source/destination path.

Observed:
- `appendToNote`, `deleteNote`, `moveNote`, and `renameNote` first resolve a default-scope source outside the queue, acquire keys derived from that preflight, then resolve the source again inside the queue.
- If the project/global winner changes while waiting, the second read can select a different path. Append/delete can mutate that unacquired path; rename can also derive an unacquired destination scope. The injected Pi queue therefore does not necessarily protect the actual mutation identity.
- Existing coordinator tests use forced project scope and do not exercise a scope-winner change during queue wait.

Why it matters:
- Pi built-ins or concurrent note operations can race the real path despite the shared queue, violating ST-002 and potentially invalidating the in-window containment guarantee.

Context files:
- `spec.md` sections 5.2 and 6
- `stories.md` ST-001/ST-002
- `src/core/storage.ts`
- `src/core/mutation.ts`
- `tests/mutation.test.ts`

Suggested follow-up:
- Make mutation identity stable from acquisition through commit (for example, lock all candidate source/destination identities in deterministic order for default selection, then resolve only inside that window).
- Add a deterministic coordinator race test proving a scope-winner change cannot redirect mutation to an unacquired path.

### GAP-003 — Uninstall does not enforce the strict no-symlink entry policy inside the notes directory

Type: incorrect-behavior

Expected:
- ST-001 requires uninstall to reject relevant symlinked components or entries; the confirmed policy rejects all relevant note-entry symlinks rather than merely avoiding target traversal.

Observed:
- `removeScopeDirectory()` validates the config/notes directories, then calls recursive `rm()` without scanning contained entries.
- A symlink entry inside a regular notes directory is unlinked by uninstall instead of causing a fail-closed rejection.
- The uninstall regression only replaces the notes directory itself with a symlink; it does not cover a symlink or broken symlink inside an otherwise regular notes directory.

Why it matters:
- Shipped behavior is weaker than the explicit strict storage policy and its documented claim that uninstall rejects relevant entries.

Context files:
- `brainstorm.md` confirmed decision 1
- `stories.md` ST-001
- `src/core/storage.ts`
- `tests/storage.test.ts`
- `docs/security.md`

Suggested follow-up:
- Validate all entries recursively inside the uninstall mutation window without following links, reject symlink/wrong-type entries, and add external-target/broken-link tests for both scopes.

### GAP-004 — Required boundary evidence remains incomplete

Type: validation-gap

Expected:
- `spec.md` section 11 requires broken-symlink coverage, scan abort evidence, an integration spy/race proving Pi queue coverage, and offline print/JSON/RPC/TUI-adapter tests.

Observed:
- No deterministic broken note-entry symlink test exists.
- Cancellation tests cover pre-abort and queue-wait abort but not abort between list/grep scan phases.
- Coordinator tests prove generic injected wrapping but do not spy on the extension's `withFileMutationQueue()` integration or race it against an independently queued Pi-style mutation.
- Mode tests exercise real print/JSON and a fake RPC context, but no TUI adapter success/error/no-duplicate check is present.

Why it matters:
- The final evidence does not fully prove the explicit audit-boundary matrix even where implementation appears intended to comply.

Context files:
- `spec.md` section 11
- `tests/storage.test.ts`
- `tests/mutation.test.ts`
- `tests/tools.test.ts`
- `tests/modes.test.ts`

Suggested follow-up:
- Add focused deterministic tests for each missing boundary and retain offline/no-credential execution.
