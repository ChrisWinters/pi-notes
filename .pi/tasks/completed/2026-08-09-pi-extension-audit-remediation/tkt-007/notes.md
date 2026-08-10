# tkt-007 notes — Stable queued identities and strict uninstall scanning

## Changes

- Append/delete now acquire all candidate project/global note paths before resolving default-scope precedence inside the mutation window.
- Move acquires all candidate source paths plus its explicit destination path.
- Rename acquires source and destination paths for every candidate source scope.
- Forced-scope behavior remains one source identity; duplicate keys are still collapsed/sorted by the coordinator.
- Uninstall now scans the complete notes tree with `lstat` inside its mutation window before removal.
- Internal symlinks/broken links are rejected, nested real directories are recursively inspected, and non-file/non-directory entries fail closed.
- No entry is removed until the complete scan succeeds.

## Decisions

- Locking both project/global candidates for default selection is intentionally conservative and removes retry/order inversion risks.
- Regular nested directories are allowed only as traversal containers during uninstall; all descendants still receive no-follow type checks.
- Existing caller-owned ancestor and cross-process limitations remain unchanged.
