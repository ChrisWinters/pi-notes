# tkt-002 Notes

Status: Done

## Changes

- Updated `tests/package-resources.test.ts` to expect `./extensions/pi-notes/index.ts` in the Pi manifest.
- Added test coverage that imports `../extensions/pi-notes/index.js`, verifies its default export is a function, and confirms it delegates to the source extension default export.
- Updated `docs/agent-docs.yaml` so `entrypoints.pi_extension.path` is `extensions/pi-notes/index.ts` and `implementation` is `src/index.ts`.
- Updated `docs/architecture.md` to document the package-specific wrapper entrypoint and existing implementation boundary.
- Checked README/docs references; README did not mention the old manifest path.

## Decisions

- Kept user-facing README unchanged because it documents commands/install behavior, not internal package manifest paths.
