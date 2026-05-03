# pi-notes shell wrapper no-op specification

Status: Ready for execution
Owner/requester: Chris
Last updated: 2026-05-03

Purpose: make the installed `pi-notes` npm bin execute the same CLI runner as `node dist/src/cli.js` when launched through a symlinked global npm bin path.

## Normative language

- `must` / `required`: mandatory for completion.
- `must not`: prohibited.
- `should`: expected unless ticket evidence documents a reason.
- `may`: optional.

## Problem statement

The package exposes a bin in `package.json`:

```json
"bin": {
  "pi-notes": "./dist/src/cli.js"
}
```

In the observed global install, `/home/chris/.nvm/versions/node/v24.14.0/bin/pi-notes` is a symlink to `../lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js`. Running `pi-notes --help` exits 0 with no output, while running the target file with Node prints usage. This makes documented global CLI flows appear successful while doing no work.

The likely root cause is the ESM direct-execution guard in `src/cli.ts`:

```ts
if (import.meta.url === `file://${process.argv[1]}`) {
  const code = await runCli(process.argv.slice(2));
  process.exitCode = code;
}
```

When Node launches a symlinked executable, `import.meta.url` can resolve to the real target path while `process.argv[1]` remains the symlink path, so the guard is false and `runCli()` is never called.

## Goals

- `pi-notes --help` must print the same usage text as `node dist/src/cli.js --help` and exit 0.
- Symlinked npm bin execution must dispatch `runCli(process.argv.slice(2))` exactly once.
- Direct Node execution of the built CLI must continue to work.
- Importing `runCli` in tests or extension code must not execute the CLI as a side effect.
- Regression coverage must prove direct-entry detection handles symlinked executable paths.

## Non-goals

- No changes to command grammar or note storage semantics.
- No changes to the Pi `/notes` extension command behavior except preserving shared command handlers.
- No new runtime dependency solely for entry-point detection.
- No publishing or global npm install is required as part of implementation.

## Relevant source paths

- `src/cli.ts` — CLI runner, flag parsing, direct-execution guard, shebang source.
- `tests/cli.test.ts` — current runCli-focused CLI tests; add regression coverage here or in a nearby test.
- `package.json` — npm bin contract and validation scripts.
- `tsconfig.json` / `tsconfig.build.json` — strict TypeScript and build output settings.
- `README.md` — documents `pi-notes <command>` and `node dist/src/cli.js` flows.
- `dist/src/cli.js` — generated build output; do not hand-edit.

## Current behavior

- `runCli()` works when called directly by tests.
- `node dist/src/cli.js --help` works because `process.argv[1]` matches the module path.
- `pi-notes --help` can no-op when `process.argv[1]` is the symlink path and `import.meta.url` is the resolved target.

## Required behavior

### Direct execution detection

Implementation must replace or wrap the current string-equality guard with symlink-safe detection. Acceptable approaches include:

1. Compare normalized realpaths for `fileURLToPath(import.meta.url)` and `process.argv[1]`.
2. Use a small exported helper whose inputs can be tested with symlink and real target paths.
3. Otherwise document an equivalent deterministic strategy in ticket notes.

The implementation must handle missing or invalid `process.argv[1]` defensively by not dispatching and not throwing during import.

### CLI dispatch

When the current module is the direct executable, the module must:

1. call `runCli(process.argv.slice(2))` once;
2. await the result;
3. assign `process.exitCode` to the returned code.

When the module is imported, it must not call `runCli()` automatically.

### Error behavior

If realpath resolution fails for entry-point detection, implementation should fall back safely to non-dispatch rather than executing unexpectedly. Any chosen fallback must be documented in `tkt-001/notes.md`.

## Safety and compatibility

- Preserve the shebang in `src/cli.ts` and generated `dist/src/cli.js`.
- Preserve all existing CLI flags and command handler behavior.
- Do not mutate notes during validation except in temporary directories or through read-only commands such as help/list.
- Do not hand-edit generated `dist/` files; run `npm run build`.

## Validation matrix

| Requirement | Validation | Expected evidence |
| --- | --- | --- |
| Symlinked direct execution dispatches | Unit or integration test creates a symlink to a built/test CLI entry or tests exported detection helper with symlink paths | Test fails before fix or explicitly covers symlink mismatch |
| Direct Node execution still works | `node dist/src/cli.js --help` after build | Usage text and exit 0 |
| Installed/global wrapper works in this environment when available | `pi-notes --help` after build/link/install context, or documented local symlink equivalent | Usage text and exit 0 |
| Importing CLI remains side-effect safe | Existing `tests/cli.test.ts` import of `runCli` plus regression test | No duplicate output/process exit |
| Repository quality gates pass | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` | All exit 0 |
| Active plan remains valid | `bash .pi/skills/task-planner/validate-active-plan.sh 2026-04-30-pi-notes-shell-wrapper-noop` | Exits 0 |

## Ticket slicing

1. `tkt-001` — implement symlink-safe entry detection and focused regression coverage.
2. `tkt-002` — validate built/local wrapper behavior and update user-facing docs if behavior/validation notes changed.
3. `tkt-003` — final reconciliation against this spec, full quality gates, and execution handoff/completion prep.

## Risks and assumptions

- Risk: direct-execution tests can be brittle if they require spawning TypeScript source directly. Mitigation: prefer an exported pure helper plus one built CLI smoke check.
- Risk: `fs.realpath` failure could mask a genuine executable invocation. Mitigation: document fallback and rely on normal existing Node direct path for common cases.
- Assumption: Node 20+ APIs from `node:url`, `node:path`, and `node:fs` are available per `package.json` engines.

## Definition of done

- [ ] Symlinked npm bin invocation dispatches CLI behavior.
- [ ] Direct Node invocation remains working.
- [ ] Importing `runCli` remains side-effect safe.
- [ ] Regression tests cover the symlink/direct-entry behavior.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
- [ ] Ticket notes/evidence are updated for each slice.
- [ ] Final ticket reconciles `spec.md`, `prd.md`, `stories.md`, and `tickets.md`.
