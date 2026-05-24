# Tickets: Unique Extension Entry Path

## tkt-001 — Add wrapper entrypoint and manifest contract

Goal: Create the unique Pi extension entrypoint and update package metadata to reference and ship it.

Scope:

- Add `extensions/pi-notes/index.ts`.
- Update `package.json` `pi.extensions` to `./extensions/pi-notes/index.ts`.
- Update `package.json` `files` to include `extensions`.
- Update TypeScript include rules if needed so the wrapper is typechecked and built.

Acceptance criteria:

- Wrapper delegates to `src/index.ts` without duplicating registration logic.
- Manifest points to the wrapper path.
- Package contents include the wrapper directory.
- `npm run typecheck` and `npm run build` can see/validate the wrapper.

Validation evidence to record:

- Relevant diffs for wrapper/manifest/config.
- Results from focused typecheck/build or full validation if run during this ticket.

## tkt-002 — Update tests/context and run validation

Goal: Lock the new entrypoint contract with tests/context updates and validate the full change.

Scope:

- Update `tests/package-resources.test.ts` to expect the wrapper manifest path and import the wrapper.
- Update `docs/agent-docs.yaml` to distinguish package entrypoint from implementation.
- Check README/docs for stale direct references to `./src/index.ts`; update only if necessary.
- Run required validation commands.

Acceptance criteria:

- Tests assert `pi.extensions` contains `./extensions/pi-notes/index.ts`.
- Tests assert `files` contains `extensions`.
- Tests import wrapper entrypoint and verify default export is a function.
- Agent docs are accurate.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.

Validation evidence to record:

- Test output summaries.
- Full validation command results.
- Optional `npm pack --dry-run` package content confirmation if run.
