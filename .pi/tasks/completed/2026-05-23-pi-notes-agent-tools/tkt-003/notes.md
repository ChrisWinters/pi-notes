# tkt-003 Notes

## Summary

Updated the bundled `pi-notes` skill for tool-first routing and completed final validation.

## Changes

- Rewrote `skills/pi-notes/SKILL.md` to prefer `notes_*` tools over CLI/direct file access.
- Added tool mapping for setup, list, show, new, append, grep, rename, and move.
- Added prompt-to-tool examples for common user phrasing.
- Preserved destructive delete/uninstall handoff as explicit `/notes ...` commands.
- Updated package resource test expectations for tool-first guidance.

## Decisions

- Removed the old global-show handoff rule because `notes_show` is intentionally part of the safe tool surface.
- Kept CLI guidance as fallback only when tools are unavailable.
