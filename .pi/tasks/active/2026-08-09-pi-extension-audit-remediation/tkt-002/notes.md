# tkt-002 notes — Coordinate mutations and honor cancellation

## Objective

Implement `spec.md` section 6 and ST-002 on top of tkt-001 safe path identities.

## Changes

- Added `MutationCoordinator` in `src/core/mutation.ts` with deterministic unique sorted multi-path acquisition.
- Preserved a process-wide local coordinator as the default for CLI/internal storage instances.
- Injected a Pi coordinator backed by `withFileMutationQueue()` into extension slash commands and tools.
- Storage mutation windows now delegate complete create/write/append/delete/setup/uninstall/move/rename operations through the injected coordinator.
- Tool `AbortSignal` now flows through command context into storage.
- Added abort checks before queueing, after queue waits, between setup/read/list/grep phases, and immediately before mutation boundaries.
- Move/rename intentionally stop checking after the consistency-critical destination-write boundary until source removal is complete.
- Added coordinator ordering/window tests, queued-abort no-mutation evidence, and pre-aborted tool coverage.

## Decisions and boundaries

- Pi canonicalizes existing target paths inside `withFileMutationQueue`; pi-notes supplies resolved absolute storage paths.
- Multi-path acquisition is sorted and nested in one direction to avoid order inversion.
- CLI coordination remains in-process only; separate CLI processes are not claimed to serialize.
- Cancellation is cooperative. It prevents not-yet-started mutations but does not interrupt an indivisible consistency-critical move/rename phase.
