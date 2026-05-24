# Unique Extension Entry Path Specification

Status: Draft
Owner/requester: human
Last updated: 2026-05-24

Purpose: Make the pi-notes Pi package load a unique package-specific extension entrypoint while preserving the existing implementation and behavior.

## 1. Problem statement

`@tribalnerd/pi-notes` currently declares its Pi extension entry directly as `./src/index.ts` in `package.json`. The desired package shape is a unique extension path under `extensions/pi-notes/index.ts`, with that file delegating to the existing source implementation. This avoids using the generic implementation path as the package resource entry without nesting or copying the whole repository.

Affected systems:

- Pi package resource discovery through `package.json` `pi.extensions`.
- Npm package contents controlled by `package.json` `files`.
- TypeScript build/typecheck configuration.
- Package resource tests in `tests/package-resources.test.ts`.

## 2. Goals and non-goals

### Goals

- Add `extensions/pi-notes/index.ts` as the package-specific Pi extension entrypoint.
- Keep the actual `/notes` extension implementation in `src/index.ts`.
- Update `package.json` so `pi.extensions` references `./extensions/pi-notes/index.ts`.
- Ensure published package contents include the new `extensions` directory.
- Ensure typecheck/build/test validation covers the new entrypoint contract.
- Update project agent context if it would otherwise describe a stale package entrypoint.

### Non-goals

- Do not move command, tool, CLI, or storage implementation out of `src/`.
- Do not copy the whole repository under `extensions/`.
- Do not change `/notes` command behavior, note storage behavior, or `notes_*` tool behavior.
- Do not add publishing, pushing, or CI automation.

## 3. Relevant source paths

- `package.json` — Pi manifest path and npm `files` package contents.
- `src/index.ts` — existing extension implementation and default export.
- `extensions/pi-notes/index.ts` — new wrapper entrypoint to create.
- `tsconfig.json` — typecheck include rules.
- `tsconfig.build.json` — build include rules and emitted `dist/` shape.
- `tests/package-resources.test.ts` — current package resource contract assertions.
- `docs/agent-docs.yaml` — agent context for entrypoints and package integration.
- `README.md` — package docs; update only if it mentions the old entry path.

## 4. Required behavior

### 4.1 Package manifest

`package.json` must declare:

```json
"pi": {
  "extensions": ["./extensions/pi-notes/index.ts"],
  "skills": ["./skills"]
}
```

`package.json` `files` must include `extensions` so the source entrypoint is present in npm package contents.

### 4.2 Wrapper entrypoint

`extensions/pi-notes/index.ts` must expose the same default extension factory as `src/index.ts` without duplicating registration logic.

Acceptable implementation shape:

```ts
export { default } from "../../src/index.js";
```

The final import specifier must pass this repository's `npm run typecheck` and `npm run build`. If TypeScript config requires a different source-compatible specifier, document that in ticket notes/evidence.

### 4.3 TypeScript/build configuration

The new wrapper must be included in typecheck and build validation. If current `tsconfig.json`/`tsconfig.build.json` only include `src/**/*.ts`, update includes narrowly to cover `extensions/**/*.ts`.

Build output should emit the wrapper under `dist/extensions/pi-notes/index.js` when build includes the wrapper.

### 4.4 Tests

`tests/package-resources.test.ts` or an equivalent focused test must assert:

- `package.json` `pi.extensions` contains `./extensions/pi-notes/index.ts`.
- `package.json` `files` contains `extensions`.
- The wrapper module can be imported and exposes a default function.
- Existing source extension exports remain available where currently tested.

### 4.5 Documentation/context

Update `docs/agent-docs.yaml` to distinguish:

- package Pi extension entrypoint: `extensions/pi-notes/index.ts`
- implementation: `src/index.ts`

Update README or human docs only if they contain a stale manifest entry path. Do not add noisy implementation detail to user-facing docs unnecessarily.

## 5. Implementation approach

1. Add the wrapper entrypoint under `extensions/pi-notes/index.ts`.
2. Update `package.json` manifest and `files` array.
3. Update TypeScript include rules if needed so the wrapper is checked and built.
4. Update resource tests to assert the new contract and import the wrapper.
5. Update `docs/agent-docs.yaml` entrypoint refs if stale.
6. Run validation and record results in ticket evidence.

## 6. Risks and assumptions

- ESM/TypeScript import specifier risk: the wrapper import must satisfy NodeNext module resolution and build output. Mitigation: use validation results to choose and record the specifier.
- Package contents risk: adding `extensions` to `files` is required so npm package installs contain the manifest-referenced source file.
- Runtime behavior risk: because the wrapper delegates to `src/index.ts`, behavior should remain unchanged; tests should import the wrapper to catch broken export wiring.

Open questions: none.

## 7. Validation matrix

| Requirement | Validation method | Command/check | Expected evidence |
| --- | --- | --- | --- |
| Manifest points to unique entry | Unit test / inspection | `npm run test` | Package resource test passes |
| Wrapper exports extension factory | Unit test | `npm run test` | Import wrapper default is a function |
| Wrapper is typechecked | Typecheck | `npm run typecheck` | No TypeScript errors |
| Wrapper emits for build | Build | `npm run build` | Build succeeds; emitted `dist/extensions/...` if included |
| Lint style preserved | Lint | `npm run lint` | No lint errors |
| Package contains wrapper | Optional packaging check | `npm pack --dry-run` | Listed package contents include `extensions/pi-notes/index.ts` |

Required validation commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Optional:

```bash
npm pack --dry-run
```

## 8. Tickets

- `tkt-001` — Add wrapper entrypoint and manifest contract.
- `tkt-002` — Update tests/context and run validation.

## 9. Definition of done

- [ ] `extensions/pi-notes/index.ts` exists and delegates to `src/index.ts`.
- [ ] `package.json` `pi.extensions` references `./extensions/pi-notes/index.ts`.
- [ ] `package.json` package contents include `extensions`.
- [ ] TypeScript config includes the wrapper where required for typecheck/build.
- [ ] Package resource tests cover the new wrapper and manifest path.
- [ ] Agent context/docs are not stale.
- [ ] Required validation commands pass.
