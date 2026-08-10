# tkt-001 notes — Secure storage roots and reject symlinks

## Objective

Implement `spec.md` sections 5 and ST-001 before queue/outcome work.

## Scope

- Parameterize config/root resolution; extension uses `CONFIG_DIR_NAME`, CLI preserves `.pi` default.
- Reject symlinked config/storage components and note entries for every read/mutation/setup/uninstall path.
- Validate regular types and canonical containment in protected windows.
- Add project/global exploit and regression tests.

## Boundaries

- Do not support contained symlinks.
- Do not redesign note names, format, or scope precedence.
- Do not claim cross-process safety.

## Execution notes

Pending execution.
