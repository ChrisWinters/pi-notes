# Security

Pi extensions run with the user's full permissions. pi-notes narrows its own note-storage operations but is not a process sandbox.

## Filesystem boundary

Four checks serve different purposes:

1. **Lexical validation:** normalized note names reject traversal, separators, absolute/home paths, control characters, and unsafe filename forms.
2. **Symlink rejection:** existing config-directory components, notes directories, and note entries must not be symbolic links, including broken or internally contained links.
3. **Type validation:** roots must be regular directories and notes must be regular files.
4. **Canonical containment:** existing paths are resolved and checked against the intended project/global root inside the protected operation window.

Reads, scans, creates, updates, moves, renames, deletes, setup, and uninstall fail closed on relevant symlinks, wrong types, or containment violations. Overwrite never follows a destination symlink. Recursive uninstall rejects a symlinked notes directory instead of traversing it.

Portable Node filesystem checks cannot prevent a privileged or concurrently malicious local process from replacing paths at every possible instruction boundary. The strict no-symlink policy and rechecks reduce that race surface; they do not defend against a compromised account or process with the same permissions.

## Destructive and overwrite actions

- `/notes rm` and `/notes uninstall` resolve targets and require explicit human confirmation.
- `/notes edit` and `/notes rewrite` require interactive editor flows; rewrite also previews and confirms.
- Slash-command/CLI move and rename overwrite require explicit `--overwrite` plus human confirmation.
- Agent move/rename tools have no overwrite parameter and return an exact interactive handoff on conflicts.
- CLI delete/uninstall require a TTY confirmation or explicit `--yes`.
- Cancellation before mutation makes no filesystem change. Move/rename preserve a coherent source/destination state once their indivisible mutation phase begins.

## Coordination

Extension mutations acquire Pi's `withFileMutationQueue()` for resolved target paths and keep complete read-modify-write windows protected. Multi-path operations acquire unique sorted keys. Standalone/internal calls use a deterministic process-local queue.

This does **not** coordinate separate CLI processes, unrelated programs, or hostile same-user filesystem mutation.

## Output privacy

Complete model-visible tool output, including its recovery notice, is bounded to 2,000 lines or 50KB. Full truncated output is written outside project/global notes to a unique OS temporary directory. On supported Unix platforms the directory is owner-only (`0700`) and file is `0600`. Deletion is scheduled after 24 hours with a timer that does not hold the host process open; extension startup and later artifact writes also reclaim stale directories. A stopped host cannot run its timer, so deletion resumes on later startup or OS temporary-directory cleanup rather than being guaranteed at an exact wall-clock instant while Pi is not running. Temporary-directory access remains subject to the host OS/account security model.

No network synchronization is performed by pi-notes.

## Roots and rebranded hosts

Extension mode uses Pi's exported configuration directory name for project and global roots. On standard Pi these are `<cwd>/.pi/notes` and `~/.pi/notes`. The standalone CLI intentionally retains `.pi` compatibility defaults and does not silently migrate data.
