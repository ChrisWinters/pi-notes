# Duplication Findings

## Finding: two small clone groups remain in command preflight and exclusive writes

**Affected paths**

- `src/commands/handlers/rewrite.ts:15-29`
- `src/commands/handlers/rm.ts:9-26`
- `src/core/storage.ts:258-262`
- `src/core/storage.ts:529-533`

**Fallow commands**

```bash
npx fallow dupes --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:944112bd --format json --quiet 2>/dev/null || true
npx fallow dupes --trace dup:d01b53c0 --format json --quiet 2>/dev/null || true
```

**Observed output**

Fallow 3.14.0 analyzed 26 files and reported two clone groups across three files: 43 duplicated lines, 104 duplicated tokens, and 1.70% line duplication.

1. `dup:944112bd` is an 18-line, two-instance flow shared by rewrite and remove: read the selected note, report a missing note, require interactive UI, then enter the operation-specific editor/confirmation flow. Fallow estimates 18 lines saved by extraction.
2. `dup:d01b53c0` is a five-line, same-file fragment around exclusive no-follow creation in `createNote()` and `writeDestination()`. The branches deliberately produce different conflict errors.

**Impact**

The command clone can drift in missing-note or UI-gating behavior as destructive handlers evolve. The storage clone is small and security-sensitive; careless consolidation could erase distinct error contracts or weaken exclusive/no-follow flags. Overall duplication is low.

**Verification notes**

- Source review confirms both fingerprints and their differing continuation/error semantics.
- Rewrite and remove share preflight behavior but diverge immediately into editor versus destructive confirmation.
- Storage already centralizes overwrite writes separately; the reported non-overwrite fragments both use `O_EXCL | O_NOFOLLOW`, but intentionally map `EEXIST` to different domain messages.

**Recommended remediation**

Treat both as low-priority refactors. If another interactive handler repeats the same preflight, extract a typed helper that returns the resolved note or a handled outcome. For storage, consolidate only through a narrow private exclusive-write primitive that accepts conflict-message context and preserves `O_EXCL`, `O_NOFOLLOW`, `0600`, handle closure, and existing error text. Keep current tests as contract guards.
