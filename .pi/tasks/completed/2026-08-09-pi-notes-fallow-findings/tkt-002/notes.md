# tkt-002 notes — Consolidate audited command and storage clones

Status: complete

## Scope

Implemented shared interactive preflight and private exclusive-write behavior exactly as defined in `spec.md`.

## Decisions and tradeoffs

- Added `resolveInteractiveNote()` in the command shared layer. It owns only lookup, exact missing-note warning/failure, and UI gating; rewrite keeps editor/preview/apply flow and remove keeps destructive confirmation/deletion.
- Added private `NotesStorage.writeFileExclusive()`. It accepts caller-specific conflict text and owns exclusive no-follow open, owner-only mode, UTF-8 write, selective `EEXIST` mapping, propagation, and `finally` closure.
- Kept overwrite writes in `writeFileNoFollow()`. Move/rename queue windows and source removal remain unchanged and source removal still follows successful destination writing.
- Added public-behavior assertions for exact missing/no-UI outcomes, no accidental editor/confirmation calls, exact conflict messages, and `0600` creation/destination modes.
- Both audited fingerprints disappeared; no suppression or no-change disposition is needed.

## Follow-up notes

None.
