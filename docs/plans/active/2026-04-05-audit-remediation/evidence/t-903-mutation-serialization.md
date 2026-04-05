# T-903 Mutation Serialization Evidence

Date: 2026-04-05
Ticket: `T-903 — Serialize per-note mutation paths`

## Change summary

- Added per-key mutation queues in `NotesStorage`.
- Routed `writeNote()` and `appendToNote()` through serialized queue execution.
- Kept append read-modify-write sequence inside a single queued critical section.

## Why this addresses race risk

Without queueing, concurrent appends can both read the same prior state and overwrite each other.
With queueing, append/write operations for the same note key execute sequentially.

## Test evidence

- Added concurrency-oriented test in `tests/storage.test.ts`:
  - `serializes concurrent appends to avoid lost updates`
- Verified both concurrently appended entries persist in final note content.

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
