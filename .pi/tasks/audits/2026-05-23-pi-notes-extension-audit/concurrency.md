# Concurrency findings

## Finding: note mutation queues are operation-keyed, not consistently file-keyed

### Affected paths

- `src/index.ts`
- `src/core/storage.ts`
- `src/commands/handlers/append.ts`
- `src/commands/handlers/move.ts`
- `src/commands/handlers/rename.ts`

### Observed behavior

The new `notes_*` tools can be called by the model in parallel. Mutating operations reuse `NotesStorage`, which has an internal static queue, but queue keys differ by operation:

- append: `append:${fileName}`
- move: `move:${fileName}`
- rename: `rename:${sourceFileName}->${destinationFileName}`
- write: `${scope}:${fileName}`

Because the queue key includes the operation name and, for rename, the destination, mutations touching the same underlying note file can run concurrently through different queues. For example, `notes_append` and `notes_move` for the same note do not share a single per-file queue key.

### Expected Pi/documented behavior

Current Pi extension docs (`docs/extensions.md`, Custom Tools) warn that tool calls run in parallel by default and state:

> If your custom tool mutates files, use `withFileMutationQueue()` so it participates in the same per-file queue as built-in `edit` and `write`.

The docs further say to resolve the real target file path and queue the entire mutation window, including read-modify-write logic.

### Impact

Parallel note tool calls can interleave and produce lost updates or surprising behavior. Examples:

- append reads project note while move simultaneously copies/removes it;
- rename and append touch the same source note through different queues;
- two rename/move operations involving the same source or destination may not serialize if their keys differ.

This weakens the advertised concurrency hardening for tool-driven note mutations.

### Recommended remediation

- Use Pi's `withFileMutationQueue()` for custom tools that mutate note files, resolving the real note path(s) before the mutation window.
- Or refactor `NotesStorage` to queue by canonical source/destination file paths consistently across append, write, move, rename, delete, and overwrite operations.
- For multi-file operations (`move`, `rename`), acquire stable queues for both source and destination paths in a deterministic order to avoid deadlocks.
- Add tests that run concurrent append/move/rename operations against the same note and assert deterministic results.
