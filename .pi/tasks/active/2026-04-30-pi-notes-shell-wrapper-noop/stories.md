# Stories: pi-notes shell wrapper no-op

## Story 1: Global CLI user gets help output

As a user who installed `@tribalnerd/pi-notes`, I want `pi-notes --help` to print usage text so that I can discover commands and confirm the executable works.

Acceptance criteria:

- Running `pi-notes --help` exits 0.
- stdout contains `Usage:`.
- stderr is empty for the happy path.

## Story 2: Agent CLI flows actually mutate notes when requested

As an agent using the `pi-notes` skill, I want `pi-notes new ...` and related commands to dispatch through the CLI runner so that successful exits correspond to real command handling.

Acceptance criteria:

- Symlinked npm bin paths are recognized as direct execution of the CLI module.
- Command handlers are invoked exactly once.
- Existing non-interactive destructive-command safeguards remain intact.

## Story 3: Maintainer can import CLI helpers safely

As a maintainer, I want tests and extension code to import `runCli` without side effects so that regression coverage can call helpers directly without accidental process output or exits.

Acceptance criteria:

- Importing `src/cli.ts` in tests does not auto-run commands.
- Direct execution still sets `process.exitCode` from `runCli()`.
- Regression coverage documents the symlinked executable case.

## Story 4: Release validation is deterministic

As a maintainer preparing a release, I want lint, typecheck, tests, build, and CLI smoke checks to prove the wrapper contract before publishing.

Acceptance criteria:

- Required npm validation scripts pass.
- Built `dist/src/cli.js --help` smoke passes.
- Wrapper/symlink smoke evidence is recorded in ticket evidence.
