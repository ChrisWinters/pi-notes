# tkt-009 notes — Complete boundary proof and repair reconciliation

## Changes

- Added both-scope broken note-link tests covering read and uninstall rejection.
- Added deterministic scan-phase cancellation using an abort signal that flips during per-entry checks.
- Added an actual extension integration test that mocks Pi's exported `withFileMutationQueue`, places an independent Pi-style mutation ahead of append on the same path, and proves the tool waits for the complete shared queue window.
- Extended direct-command adapter coverage to TUI success and missing-note warning paths; each emits exactly one notification alongside existing RPC one-notification and headless no-notification evidence.
- Added the Pi queue integration test to scan-first agent docs and reran docs/package/build reconciliation.

## Reconciliation

All four validator findings now have implementation and deterministic evidence in tkt-007 through tkt-009. Root `gaps.md` remains unchanged for independent validator ownership.
