# tkt-001 notes — Fix symlink-safe CLI entry detection

## Scope

Implement and test a fix for the CLI direct-execution guard in `src/cli.ts` so symlinked npm bin paths dispatch the CLI runner.

## Starting context

- Current guard compares `import.meta.url` directly to `file://${process.argv[1]}`.
- Observed global npm bin path is a symlink to `dist/src/cli.js`.
- `node dist/src/cli.js --help` works, while `pi-notes --help` can exit 0 with no output.

## Implementation notes

- Confirmed root cause in `src/cli.ts`: the direct-execution guard compared `import.meta.url` to `file://${process.argv[1]}`, so an npm/global symlink path in `process.argv[1]` could fail to match the resolved module URL and skip `runCli()`.
- Added exported `isDirectCliEntry(moduleUrl, argvEntryPath)` that compares realpaths of `fileURLToPath(import.meta.url)` and `process.argv[1]`.
- Missing, empty, invalid, or unresolvable entry paths return `false` so imports and detection failures do not dispatch unexpectedly.
- Updated the top-level guard to call `runCli(process.argv.slice(2))` only when `isDirectCliEntry()` returns true.
- Added focused regression coverage in `tests/cli.test.ts` for symlinked entry paths, direct target paths, missing argv entry, and unresolvable argv entry.
