# tkt-003 notes — Typed outcomes and truthful tool contracts

## Changes

- Added explicit `success | failure | cancelled` command outcomes independent of notification severity.
- Added outcome-aware failure/cancellation helpers and migrated validation, not-found, blocked, and user-cancelled handler paths.
- `handleNotesCommand*` now returns the domain outcome while preserving existing UI notifications.
- CLI returns nonzero for failed/cancelled requested operations even when presentation remains a warning on stdout.
- Tools throw whenever the domain outcome is not successful; empty list and no-match grep continue as successful rendered results.
- Removed `overwrite` from `notes_move` and `notes_rename` schemas and argv generation.
- Destination conflicts now append an exact safely quoted interactive `/notes ... --overwrite` handoff.
- Updated the bundled skill to prohibit agent overwrite and delegate confirmation to the user.

## Boundaries

- Interactive overwrite remains available only through slash command/CLI confirmation flows.
- Notification levels remain presentation choices and no longer define automation success.
- Interactive cancellation is a clean non-successful outcome, not a completed mutation.
