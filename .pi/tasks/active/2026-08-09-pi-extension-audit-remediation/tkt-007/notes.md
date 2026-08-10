# tkt-007 notes — Stable queued identities and strict uninstall scanning

## Objective

Implement ST-007 and repair validator GAP-002/GAP-003.

## Scope

- Acquire all possible default-scope source/destination identities before resolving a mutation winner.
- Prove winner changes cannot redirect writes/removals outside acquired keys.
- Recursively validate uninstall entries no-follow inside the mutation window and reject before any removal.
- Cover project/global internal symlink, broken-link, wrong-type, and external-target preservation.

## Execution notes

Pending execution.
