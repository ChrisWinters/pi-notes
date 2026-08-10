# tkt-002 evidence

Status: complete

## Focused validation

- `npm run typecheck` — PASS after aligning the optional signal type with Pi's `AbortSignal | undefined` context contract.
- `npm run lint` — PASS after replacing an unnecessary async test callback.
- `npm run test -- --run tests/mutation.test.ts tests/storage.test.ts tests/tools.test.ts` — PASS, 3 files / 38 tests.

## Repository validation

- `npm run test` — PASS, 9 files / 104 tests.
- `npm run build` — PASS.
- Coordinator test proves duplicate keys collapse and `/a` is acquired before `/z`.
- Storage test proves append's read-modify-write occurs inside one injected mutation window.
- Queue-wait cancellation test proves an aborted create does not create the note after the queue releases.
- Tool test proves a pre-aborted `notes_new` rejects and leaves no note.

## Fallow

- Optional fallow audit remains unavailable because the executable is not installed; no network/global installation was attempted.

## Commit

This evidence is included with the ticket slice committed as `fix(notes): coordinate mutations and cancellation`.
