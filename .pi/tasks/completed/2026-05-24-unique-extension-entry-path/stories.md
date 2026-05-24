# Stories: Unique Extension Entry Path

## Story 1: Package loads a unique extension entrypoint

As a Pi package installer, I want the package manifest to point at `extensions/pi-notes/index.ts` so the extension entry path is package-specific and clearly separated from implementation source.

Acceptance criteria:

- `package.json` `pi.extensions` contains `./extensions/pi-notes/index.ts`.
- `extensions/pi-notes/index.ts` exists.
- Importing the wrapper exposes a default extension registration function.

## Story 2: Maintainer keeps implementation in src

As a maintainer, I want the wrapper to delegate to `src/index.ts` so existing `/notes` command and tool implementation remains centralized.

Acceptance criteria:

- No command/tool registration logic is duplicated in `extensions/pi-notes/index.ts`.
- Existing source extension exports remain intact.
- Existing command/tool tests continue to pass.

## Story 3: Package contents and build remain valid

As a maintainer, I want package contents, typecheck, tests, and build to include the new wrapper so package installs do not reference a missing file.

Acceptance criteria:

- `package.json` `files` includes `extensions`.
- TypeScript validation succeeds with the wrapper.
- Build succeeds with the wrapper included where required.
- Package resource tests cover the manifest and wrapper contract.

## Story 4: Agent context remains accurate

As an agent working in this repository, I want `docs/agent-docs.yaml` to identify the new package entrypoint and existing implementation path correctly.

Acceptance criteria:

- Agent docs distinguish `extensions/pi-notes/index.ts` as package entrypoint.
- Agent docs retain `src/index.ts` as the implementation reference.
