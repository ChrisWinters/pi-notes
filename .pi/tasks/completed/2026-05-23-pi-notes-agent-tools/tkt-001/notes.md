# tkt-001 Notes

## Summary

Implemented shared pi-notes tool infrastructure in `src/index.ts`.

## Changes

- Added exported tool-name getter functions for all planned `notes_*` tools.
- Added provider-compatible enum schemas for note scope and move destination using `Type.Unsafe` JSON-schema enum objects.
- Added a shared `executeNotesTool()` adapter that routes tool argv through `handleNotesCommandArgv()` with a captured `NotesCommandContext`.
- Adapter captures handler notifications, returns joined text content, and exposes structured details with `tool`, `argv`, `ok`, and `messages`.

## Decisions

- Kept tool execution routed through existing command handlers to preserve parser, storage validation, atomic create behavior, and mutation queues.
- Used this package’s current `@mariozechner/pi-coding-agent` import path rather than the newer docs package name.
