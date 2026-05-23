# tkt-003 Notes

Implemented same-note mutation serialization improvements:

- `createNote()` now queues by target note path before atomic create.
- `writeNote()` queues by target note path instead of `scope:fileName` text keys.
- `appendToNote()` resolves the initial note, queues by the source path, then re-reads inside the queue before read-modify-write.
- `deleteNote()` resolves/queues/re-checks before removing.
- `moveNote()` and `renameNote()` now acquire deterministic multi-key queues for source and destination paths.
- Added `withMutationQueues()` to acquire multiple queue keys in sorted order and avoid deadlocks.
- Added storage regression tests for concurrent append+move and competing renames.

This keeps serialization at the storage layer, so CLI, slash commands, and agent tools share the same protection.
