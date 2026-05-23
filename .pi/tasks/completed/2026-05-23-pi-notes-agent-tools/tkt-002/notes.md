# tkt-002 Notes

## Summary

Registered the safe pi-notes tool set and added representative execution tests.

## Changes

- Registered `notes_setup`, `notes_list`, `notes_show`, `notes_new`, `notes_append`, `notes_grep`, `notes_rename`, and `notes_move` from the extension default export.
- Added descriptions, prompt snippets, and prompt guidelines that name each tool explicitly.
- Added tool argv mapping for scope flags, move destination flags, and overwrite options.
- Added tests with a fake `ExtensionAPI` to verify registration and omission of destructive/editor tools.
- Added tool execution tests for setup, create/show, append/search/list, rename/move, and error handling.

## Decisions

- Did not register `notes_rm`, `notes_uninstall`, `notes_edit`, or `notes_rewrite` to preserve first-slice safety boundaries.
