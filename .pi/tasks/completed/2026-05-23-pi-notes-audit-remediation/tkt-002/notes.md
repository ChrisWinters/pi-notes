# tkt-002 Notes

Implemented custom tool contract fixes:

- Updated `executeNotesTool()` to throw an `Error` when command handling emits any error-level notification.
- Preserved the captured command message as the thrown error text.
- Added `truncateHead()` with `DEFAULT_MAX_BYTES` / `DEFAULT_MAX_LINES` to bound successful tool output.
- Added a visible truncation notice that points users to `/notes` or the `pi-notes` CLI for full output.
- Updated tool tests so duplicate create rejects/throws and large note output is truncated.

Slash command and CLI behavior were not changed.
