# tkt-002 evidence — Consolidate audited command and storage clones

Status: complete

## Focused behavior

- `npm run test -- tests/commands.test.ts tests/storage.test.ts` — PASS, 2 files and 60 tests.
- Command tests prove exact `Note not found: missing-note` warning with failure outcome and no editor/confirmation, plus exact no-UI error with no mutation UI calls.
- Storage tests prove `Note already exists: private.md`, destination conflict messages for move/rename, owner-only create/destination mode, and source preservation on destination conflict.

## Safety source review

- `writeFileExclusive()` opens with `O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW`, mode `0600`, writes complete UTF-8 content, maps only `EEXIST`, rethrows other errors, and closes an opened handle in `finally`.
- Create and destination callers supply distinct exact conflict text.
- Overwrite remains separate and validates the destination before a no-follow truncating write.
- Move/rename still acquire sorted candidate mutation identities around winner selection, destination validation/write, and source removal. Source `rm()` remains after awaited destination success.

## Duplication

- Before: 2 groups, 4 instances, 43 duplicated lines, 104 duplicated tokens, 1.70%; fingerprints `dup:944112bd` and `dup:d01b53c0`.
- After: 0 groups, 0 instances, 0 duplicated lines/tokens, 0.0%.
- Both original trace commands return `no clone group with fingerprint`, expected because the groups were resolved.
- No suppression or accepted residual exists.

## Additional validation

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `git diff --check` — PASS.

## Commit

Recorded by the repository commit with subject `refactor(notes): consolidate audited safety flows`.
