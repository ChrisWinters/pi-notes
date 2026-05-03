# PRD: pi-notes shell wrapper no-op

## Problem

Users can install or link `@tribalnerd/pi-notes` and receive a `pi-notes` executable that exits 0 with no output because the CLI's direct-execution guard does not recognize symlinked npm bin paths. This breaks documented CLI examples and makes note creation appear successful even when nothing ran.

## Users

- Pi users invoking `pi-notes <command>` from a global npm install/link.
- Agents using the bundled `pi-notes` skill that routes note requests to CLI flows.
- Maintainers validating package CLI behavior before release.

## Goals

- The `pi-notes` executable reliably runs CLI commands when invoked as an npm bin.
- Help/list/read-only smoke checks provide visible output instead of silent success.
- Existing import-based tests and Pi extension command behavior remain unchanged.

## Requirements

1. `pi-notes --help` must print usage and exit 0.
2. `node dist/src/cli.js --help` must continue to print usage and exit 0.
3. The CLI module must remain safe to import without automatically executing commands.
4. Regression coverage must protect symlinked direct-entry detection.
5. Implementation must preserve command grammar, storage behavior, and safety prompts.

## Non-requirements

- No changes to note file format.
- No new commands.
- No publishing step.
- No destructive validation against real user notes.

## Acceptance criteria

- Quality gates pass: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- Built CLI help command works through direct Node invocation.
- Symlinked wrapper behavior is validated by automated coverage and/or local wrapper smoke evidence.
- Execution plan validation passes.
