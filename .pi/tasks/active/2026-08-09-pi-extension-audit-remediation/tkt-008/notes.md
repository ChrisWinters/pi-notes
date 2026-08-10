# tkt-008 notes — Bounded output and active artifact expiration

## Changes

- Tool truncation now creates the recovery artifact first, reserves the exact UTF-8 bytes and two line separators needed by its notice, and truncates content to the remaining Pi budget.
- The complete returned text, including artifact path, remains within `DEFAULT_MAX_BYTES` and `DEFAULT_MAX_LINES`.
- Artifact creation schedules recursive deletion at the retention deadline with an unref'd timer and guarded cleanup errors.
- Stale cleanup is exported and invoked during extension registration as well as before each artifact creation.
- Tests cover final returned bounds, live deadline deletion, startup stale cleanup, later-write cleanup, permissions, and full-content recovery.
- README, command/security docs, tool descriptions, and changelog now distinguish live scheduled deletion from later startup/OS cleanup after the host has stopped.

## Residual boundary

A stopped process cannot execute its timer. Stale output is reclaimed on later extension registration/artifact creation or by OS temporary-directory policy; docs no longer claim exact wall-clock deletion while no host runs.
