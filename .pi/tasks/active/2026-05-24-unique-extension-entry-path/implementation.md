# Implementation Plan: Unique extension entry path

## Goal and outcome

Rename the Pi extension package entry path for `@tribalnerd/pi-notes` so Pi loads a package-specific wrapper at `extensions/pi-notes/index.ts` while the implementation remains in `src/index.ts`.

Successful outcome:

- `package.json` declares `pi.extensions: ["./extensions/pi-notes/index.ts"]`.
- The npm package includes the new `extensions/` entrypoint directory.
- `extensions/pi-notes/index.ts` delegates to the existing `src/index.ts` extension implementation.
- Existing `/notes` command and `notes_*` tool behavior remains unchanged.
- Standard validation passes.

## Scope

In scope:

- Add a thin extension wrapper entrypoint under `extensions/pi-notes/index.ts`.
- Update package manifest Pi extension path.
- Update package manifest published files to include the wrapper entrypoint.
- Add or adjust focused tests only if needed to lock the package manifest/entry contract.
- Update docs only if an existing doc references the old `./src/index.ts` manifest path.

Out of scope / non-goals:

- Moving the actual implementation out of `src/`.
- Copying or nesting the whole repository under `extensions/`.
- Changing command grammar, note storage, CLI behavior, or agent tools.
- Publishing, CI, or release automation changes.

## Assumptions and risks

- Pi package manifest paths are relative to package root and can point to `.ts` files under `extensions/`, per Pi package docs.
- The wrapper should use the import specifier accepted by this repository's TypeScript and runtime setup. Prefer TypeScript-compatible source import semantics validated by `npm run typecheck` and `npm run build`.
- Because this package uses ESM and TypeScript, the exact wrapper export form should be verified rather than guessed.
- If `tsconfig` does not include the new `extensions/` source directory, validation may require a targeted config update or an import form that remains compatible with build tooling.

## Source/context files for spec creation

Read these before implementation:

- `package.json` — Pi package manifest, npm `files`, scripts, package metadata.
- `tsconfig.json` and `tsconfig.build.json` — TypeScript include/exclude and emitted output expectations.
- `src/index.ts` — current extension implementation and default export.
- `README.md` — package install/behavior docs; check for references to extension entry paths.
- `docs/agent-docs.yaml` — project map; update only if entrypoint references become stale.
- Pi docs:
  - `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md`
  - `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`

## Suggested spec-ready chunks

### Chunk 1: Manifest and wrapper entrypoint

- Create `extensions/pi-notes/index.ts`.
- Delegate the default export to the existing extension implementation in `src/index.ts`.
- Update `package.json` `pi.extensions` to `./extensions/pi-notes/index.ts`.
- Update `package.json` `files` to include `extensions`.

### Chunk 2: Build/test compatibility

- Confirm TypeScript includes or validates the new wrapper as needed.
- If necessary, adjust `tsconfig`/`tsconfig.build` narrowly so the wrapper is typechecked and emitted consistently.
- Add a focused test for the package manifest and wrapper path if the existing test suite does not cover this contract.

### Chunk 3: Context/doc cleanup

- Update `docs/agent-docs.yaml` entrypoint references from `src/index.ts` as the package entry to `extensions/pi-notes/index.ts`, while retaining `src/index.ts` as implementation reference.
- Update README or other docs only if they explicitly mention the old manifest entry path.

## Dependencies and ordering

1. Inspect TypeScript config and existing tests.
2. Implement wrapper + manifest changes.
3. Adjust config/tests/docs if validation shows stale or untracked entrypoint assumptions.
4. Run full validation.

## Validation expectations

Run before handoff/completion:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Optional focused checks if needed:

- Inspect `dist/` output to confirm build emits the wrapper if package publishing expects compiled artifacts.
- Run `npm pack --dry-run` to confirm `extensions/pi-notes/index.ts` is included in package contents.

## Human review gates

- Human review is appropriate after the execution spec is created and before ticket execution if the import/export form is ambiguous.
- Human review is required if validation suggests a larger packaging/build reorganization than the thin wrapper + manifest update described here.
