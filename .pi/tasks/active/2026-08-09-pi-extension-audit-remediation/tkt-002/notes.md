# tkt-002 notes — Coordinate mutations and honor cancellation

## Objective

Implement `spec.md` section 6 and ST-002 on top of tkt-001 safe path identities.

## Scope

- Inject deterministic mutation coordinator behavior.
- Join Pi `withFileMutationQueue()` over full extension mutation windows.
- Preserve CLI local serialization and avoid nested acquisition deadlocks.
- Thread/check abort signals at queue, scan, and mutation boundaries.
- Add concurrency and cancellation regression tests.

## Boundaries

- No cross-process CLI locking requirement.
- Cancellation must preserve coherent move/rename state.

## Execution notes

Pending execution.
