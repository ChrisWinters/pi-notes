# tkt-001 notes — Fix symlink-safe CLI entry detection

## Scope

Implement and test a fix for the CLI direct-execution guard in `src/cli.ts` so symlinked npm bin paths dispatch the CLI runner.

## Starting context

- Current guard compares `import.meta.url` directly to `file://${process.argv[1]}`.
- Observed global npm bin path is a symlink to `dist/src/cli.js`.
- `node dist/src/cli.js --help` works, while `pi-notes --help` can exit 0 with no output.

## Implementation notes

(To be filled by task-executor.)
