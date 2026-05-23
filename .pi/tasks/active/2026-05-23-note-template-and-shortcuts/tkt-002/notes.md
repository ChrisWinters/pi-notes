# tkt-002 Notes

## Summary

Added hidden `add` and `list` aliases for existing create/list commands.

## Changes

- `src/commands/handlers/index.ts`: registered `add: handleNew` and `list: handleLs`.
- `tests/commands.test.ts`: added command coverage for `/notes add` and `/notes list`.
- `tests/commands.test.ts`: added non-exposure checks for `NOTES_USAGE` and README.

## Decisions

- Reused canonical handlers directly so aliases inherit all existing scope, validation, and error behavior.
- Kept aliases out of public help and README command lists as required.
