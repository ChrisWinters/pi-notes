# PRD: Unique Extension Entry Path

## Summary

Pi-notes should expose a unique Pi package extension entrypoint at `extensions/pi-notes/index.ts` while keeping implementation code in `src/index.ts`.

## Problem

The current Pi manifest points directly to `./src/index.ts`. A package-specific entry path is clearer and avoids generic source-path registration without requiring the repository to be nested under `extensions/`.

## Users and stakeholders

- Pi users installing `@tribalnerd/pi-notes` as a package.
- Maintainers reviewing package resource structure.
- Agents relying on package metadata and project context.

## Requirements

1. The Pi package manifest must reference `./extensions/pi-notes/index.ts`.
2. The package must include the `extensions` directory in npm package contents.
3. The wrapper entrypoint must delegate to `src/index.ts` and preserve extension behavior.
4. TypeScript validation and build must include the wrapper where appropriate.
5. Tests must cover the manifest path and wrapper import contract.
6. Project agent context must not describe the package entrypoint incorrectly.

## Non-requirements

- No command grammar changes.
- No storage model changes.
- No CLI behavior changes.
- No release/publish automation changes.

## Acceptance criteria

- `package.json` contains `"./extensions/pi-notes/index.ts"` in `pi.extensions`.
- `package.json` `files` contains `"extensions"`.
- `extensions/pi-notes/index.ts` exists and exports the extension factory from `src/index.ts`.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
