# tkt-004 notes — Recover truncated output and fix mode observability

## Changes

- Added secure full-output artifacts under unique OS temporary directories.
- Artifact directories use owner-only permissions and output files are opened exclusively and forced to mode `0600` where supported.
- Truncated tool results now expose the full artifact path, Pi truncation structure, and retention duration in `details` without retaining the unbounded notification payload there.
- Artifacts remain available for 24 hours and expired pi-notes artifact directories are removed opportunistically on later artifact creation.
- List, show, and grep tool descriptions state the 2,000-line/50KB limits and recovery policy.
- Direct `/notes` commands in print/JSON now fail observably on stderr with an exact standalone `pi-notes ...` handoff.
- TUI/RPC continue through the existing notification adapter; tests prove RPC emits one notification without duplicate transport.

## Pi mode prototype

A minimal installed-Pi command prototype proved that throwing from an extension command in print/JSON:

- emits an observable `Extension error (command:...)` on stderr;
- does not inject a custom message into model context;
- does not add non-protocol output to JSON stdout;
- currently exits with Pi process status 0.

Because command handler return values have no documented result channel, `pi.sendMessage()` pollutes model context, and UI notification is a headless no-op, the approved observable-unsupported fallback was selected. Offline integration tests exercise the real Pi executable with stdin closed and no model credentials.

## Boundaries

- Cleanup is opportunistic rather than a background timer, so same-session access is preserved while retention remains bounded when artifacts continue to be produced.
- Cleanup only considers real directories with the private `pi-notes-output-` prefix; symlinks are not traversed.
- A temporary artifact write or permission failure rejects the tool rather than returning unrecoverable truncated output.
