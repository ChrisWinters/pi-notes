# Pi extension audit remediation specification

Status: Approved for spec check
Owner: agent-managed lifecycle
Last updated: 2026-08-09

Purpose: Correct all evidenced 2026-08-09 pi-notes extension audit findings without expanding the product beyond its human-first notes contract.

## Normative language

- **must / required**: mandatory for completion.
- **must not**: prohibited.
- **should**: expected unless evidence documents a safer equivalent.
- **may**: optional and non-blocking.
- **implementation-defined**: implementation must choose, test, and document a behavior within stated bounds.

## 1. Problem and current system

`NotesStorage` constructs literal `.pi` paths, validates names lexically, and performs filesystem operations that follow symlinks. It serializes mutations with a private lexical-path queue. `src/index.ts` adapts commands to tools by capturing UI notifications, ignores tool abort signals, exposes overwrite parameters that non-UI execution cannot confirm, and truncates without retaining full output. All slash-command output uses UI notifications, which are silent in print/JSON. Package metadata, docs, tests, and release workflow diverge from current Pi contracts.

Affected surfaces are `src/core/*`, `src/commands/*`, `src/index.ts`, `src/cli.ts`, tests, package metadata, public docs/skill, build output, and GitHub workflows.

Pi extensions and installed packages run with full user permissions; this spec therefore treats filesystem containment and release authorization as security boundaries.

## 2. Goals

- Enforce strict non-symlink note storage under validated project/global roots.
- Use host configuration paths correctly without breaking standalone CLI defaults.
- Coordinate extension mutations with Pi and honor cancellation.
- Produce explicit domain outcomes and truthful tool schemas/errors.
- Retain complete truncated results securely.
- Make headless slash-command behavior observable.
- Align package/release contracts and prove behavior with tests/docs.

## 3. Non-goals

- Publishing, pushing, changing note format/naming/scope precedence, agent overwrite authorization, symlink support, cross-process CLI locks, pagination, or unrelated workflow changes.

## 4. Required source context

Execution must consult:

- this task's `implementation.md`, `brainstorm.md`, `stories.md`, and `tickets.md`;
- audit files under `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/`;
- `README.md`, `package.json`, `docs/agent-docs.yaml`, `src/index.ts`, and relevant source/tests;
- current installed Pi docs/examples cited by the audit before changing Pi-specific behavior.

## 5. Filesystem and configuration contract

### 5.1 Roots

- Storage must accept an explicit validated config-directory name or resolved root configuration rather than hardcode `.pi` internally.
- Extension mode must derive project and global roots using Pi's exported `CONFIG_DIR_NAME`.
- Standalone CLI must default to `.pi` for compatibility.
- A CLI override, if implemented, must be explicit, narrowly validated, apply consistently to project/global roots, and must not silently migrate data.

### 5.2 Symlinks and containment

- Existing config-directory components, notes directories, and note entries used by any operation must not be symbolic links.
- Notes expected as files must be regular files; scope roots expected as directories must be regular directories.
- Reads/list/grep/show and every mutation must fail closed on a relevant symlink, broken symlink, wrong entry type, or containment violation.
- Create/setup must not create through a symlinked parent.
- Move/rename overwrite must not follow destination symlinks.
- Delete/uninstall must not traverse or recursively remove an external symlink target.
- Canonical containment/type checks must occur within the operation's protected queue/mutation window wherever a preflight could become stale.
- Error text must identify the rejected scope/path safely and suggest removal of the symlink; it must not expose note content.

## 6. Mutation and cancellation contract

- A coordinator abstraction must cover the complete read-modify-write window.
- Extension tool mutations must participate in Pi's `withFileMutationQueue()` using resolved absolute real target identities where applicable.
- CLI/internal execution must retain deterministic in-process serialization without requiring an active Pi host.
- Multi-path move/rename must acquire unique keys in sorted deterministic order and avoid nested order inversion/deadlock.
- The implementation must document that separate CLI processes are not coordinated.
- Tool `AbortSignal` must be threaded into execution/storage context.
- Abort must be checked before queueing, after waiting, between scans/phases, and before starting a mutation.
- An operation cancelled before mutation begins must make no filesystem change and must surface cancellation as failure.
- Once an indivisible consistency-critical step begins, implementation must preserve a coherent source/destination state before reporting interruption; it must not deliberately leave partial move/rename state.

## 7. Outcome and tool contract

- Shared command handling must return or expose an explicit typed domain outcome independent of UI notification level.
- Adapters must map that outcome to:
  - TUI/RPC notifications and confirmation/editor flows;
  - CLI stdout/stderr and nonzero exit status for failed requested operations;
  - thrown tool errors for not-found, invalid, blocked, conflict, and cancelled requested operations.
- Empty list and no-match grep are successful outcomes.
- User-cancelled interactive destructive operations are clean cancellations, not successful mutations.
- `notes_move` and `notes_rename` schemas must not include `overwrite`.
- Destination conflicts from those tools must include exact safe handoffs:
  - `/notes move <safe-name> --to-global|--to-project [source scope] --overwrite`
  - `/notes rename <safe-from> <safe-to> [scope] --overwrite`
- Agent skill/docs must not instruct models to send removed parameters.
- Existing slash command/CLI overwrite confirmation remains human-gated.

## 8. Output and mode contract

### 8.1 Truncation

- Tool output must remain bounded by Pi's line/byte limits.
- On truncation, complete output must be written to an owner-only OS temporary file outside project/global note storage.
- The result must include artifact path and structured line/byte truncation metadata.
- Relevant tool descriptions must state limits.
- Retention must be bounded and implementation-defined, documented, and long enough for a current-session follow-up read.
- Cleanup must not delete an artifact before the result can reasonably be consumed and must not retain artifacts indefinitely.

### 8.2 Modes

- A focused prototype must determine whether current Pi APIs can emit direct extension-command results in print/JSON without duplicate TUI/RPC output or model-context pollution.
- If safe, print/JSON `/notes` must emit observable success/error results.
- If unsafe, print/JSON must emit an observable unsupported result with an exact `pi-notes ...` CLI handoff.
- Zero-output exit success for a handled `/notes` command is prohibited.
- TUI and RPC must retain functional notifications/dialogs and must not receive duplicate output.
- Mode tests must run offline and without model credentials.

## 9. Package and release contract

- `@earendil-works/pi-coding-agent` and `typebox` must be `peerDependencies` with `"*"` ranges.
- Both must remain available in `devDependencies` at repository-tested versions.
- TypeBox must not remain a direct runtime dependency solely for extension schemas.
- Lockfile and tests must reflect the new metadata.
- Npm dry-run packaging must include required TypeScript extension source, skill, README/license, and compiled CLI dependencies without bundling a duplicate Pi core runtime.
- CI must use `npm ci --no-audit --no-fund`.
- Publish workflow must trigger on `release.published` and protected `workflow_dispatch`, not release-branch pushes.
- Publish must verify tag/version agreement before `npm publish --provenance`.
- Workflow permissions must remain least privilege (`contents: read`, `id-token: write`).
- A protected environment must be declared when a repository-evidenced name exists; otherwise docs must mark external environment setup as required and no name may be invented.
- Execution must not invoke npm publish.

## 10. Failure model

| Failure | Required behavior |
| --- | --- |
| Unsafe name | Existing validation error; no filesystem access outside safe preflight |
| Symlink/wrong type/escape | Fail closed; no target read/mutation |
| Destination conflict | Preserve both notes; tool gives exact interactive handoff |
| Abort before mutation | No mutation; tool/CLI failure as appropriate |
| Abort during consistency-critical phase | Preserve coherent state; report interruption after safe boundary |
| Temp artifact creation/permission failure | Tool fails rather than return unrecoverable truncated success |
| Unsupported print/JSON output API | Observable unsupported result plus CLI handoff |
| Tag/version mismatch | Publish job fails before npm publish |
| Missing external protected environment config | Documented human setup; no publish attempted by this task |

## 11. Validation matrix

| Requirement | Evidence |
| --- | --- |
| Symlink rejection/containment | Unit/integration tests for file, directory, broken, destination symlinks across both scopes; exploit target unchanged |
| Config directory | Storage and extension adapter tests for `CONFIG_DIR_NAME`; CLI default/override tests |
| Shared queue | Coordinator tests plus integration spy/race proving Pi queue wraps complete mutation window |
| Cancellation | Pre-abort, queued abort, scan abort, and no-mutation assertions |
| Typed outcomes | Handler/CLI/tool tests for success, no-match, not-found, blocked, conflict, cancellation |
| Tool schema | Registered schema assertions; no overwrite; exact handoff strings |
| Truncation | Full artifact content, owner-only permissions where portable, outside-project path, metadata, cleanup policy tests |
| Modes | Offline print/JSON/RPC/TUI-adapter tests; observable output and no duplicates |
| Package | Metadata assertions, lockfile consistency, extension import, `npm pack --dry-run` inspection |
| Release | Static workflow assertions for triggers, environment policy, version preflight, permissions, `npm ci` |
| Docs/build | Docs contract tests where useful, changelog review, generated dist diff, full gate |

Required final commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Focused commands may run per ticket. Optional fallow analysis may be used because the registered skill is available, but it must not replace required checks.

## 12. Ticket sequence

- `tkt-001`: filesystem/config safety foundation.
- `tkt-002`: queue/cancellation integration.
- `tkt-003`: typed outcomes/tool contract.
- `tkt-004`: truncation/modes.
- `tkt-005`: package/release.
- `tkt-006`: docs/build/final reconciliation.
- `tkt-007`: stabilize mutation keys and strict uninstall scanning.
- `tkt-008`: bound final output and actively expire artifacts.
- `tkt-009`: complete boundary evidence and repair reconciliation.

Each ticket must update `notes.md`, `evidence.md`, `tickets.md`, and commit a coherent slice. Source changes and their focused tests belong in the same ticket.

## 12.1 Validator repair requirements

### Stable mutation identities

- Default-scope append/delete/move/rename must acquire every possible project/global source identity before selecting the winner inside the queue.
- Move must also acquire its explicit destination path; rename must acquire destination paths corresponding to every possible source scope.
- The implementation must never mutate a path absent from the acquired key set, including when the project/global winner changes while waiting.
- A deterministic test must hold queue acquisition, change the winner, and prove the eventual source/destination keys were already acquired.

### Strict uninstall traversal

- Before recursive scope removal, the implementation must recursively inspect the regular notes tree inside the protected window using no-follow metadata.
- Any symlink, broken symlink, or wrong-type filesystem entry must reject uninstall before any entry is removed.
- Tests must cover internal links for project and global scope and prove external targets and the notes tree remain unchanged.

### Bounded result and artifact expiry

- The complete returned tool text, including recovery notice/path, must not exceed `DEFAULT_MAX_LINES` or `DEFAULT_MAX_BYTES`.
- Newly created artifacts must schedule deadline deletion while the process remains alive without keeping the process alive.
- Expired artifacts must also be reclaimed during extension registration/startup and before new artifact writes.
- Documentation must state the residual honestly: a stopped host cannot execute scheduled cleanup; stale cleanup resumes at later startup and the OS may independently clean temporary files.
- Tests must assert final result bounds, scheduled deletion, and startup cleanup.

### Missing boundary evidence

- Add deterministic broken-link rejection, scan-phase cancellation, Pi-style queue integration/race, and TUI adapter success/error/no-duplicate coverage.
- Mode tests remain offline and credential-free.

## 13. Risks and assumptions

- Strict symlink rejection is an intentional compatibility break.
- Portable Node filesystem APIs may constrain race resistance; implementation must fail closed and document any residual platform limitation.
- Queue abstraction must avoid double-acquisition deadlocks.
- Temp artifacts contain private note content and require restrictive creation/retention.
- Mode APIs may force the approved observable-unsupported fallback.
- Protected environment configuration is partly external and cannot be silently invented.

Open questions: none.

## 14. Definition of done

- All nine tickets are checked and have evidence/commits.
- Every story acceptance criterion is met.
- The exploit and all audited boundary regressions are covered and pass.
- Required validation and offline smoke checks pass.
- Docs, skill, changelog, package metadata, workflows, and generated dist match implementation.
- No npm publish or push occurred.
- Independent task validation reports no unresolved gaps.
