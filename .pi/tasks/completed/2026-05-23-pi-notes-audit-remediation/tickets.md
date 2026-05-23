# Tickets: pi-notes audit remediation

## [x] tkt-001: Align Pi package imports and dependency metadata

### Scope

- Update `src/index.ts` and tests from old Pi/typebox import names to current documented imports when compatible.
- Update `package.json` and lockfile dependency metadata.
- Add a smoke test for extension-entry import/load resolution.

### Acceptance criteria

- `npm run typecheck` and `npm run build` pass after dependency/import changes.
- Smoke coverage fails if the source extension entry cannot resolve runtime imports.
- Any package availability blocker is recorded in evidence/gaps.

## [x] tkt-002: Correct tool errors and output truncation

### Scope

- Update the shared notes tool adapter in `src/index.ts`.
- Throw from tool execution when command handling emits error-level notifications.
- Truncate returned tool text using documented utilities or equivalent limits.
- Update/add tests in `tests/tools.test.ts`.

### Acceptance criteria

- Duplicate create or equivalent tool-domain error rejects/throws.
- Large tool output is truncated with a visible marker.
- Slash command behavior remains user-friendly.

## [x] tkt-003: Serialize same-note mutations consistently

### Scope

- Refactor `src/core/storage.ts` mutation queue keys/acquisition.
- Cover append, write/new, move, rename, and delete/remove where applicable.
- Add concurrency regression tests.

### Acceptance criteria

- Same-note operations use canonical queueing instead of operation-prefixed keys.
- Multi-file mutations acquire queues in deterministic order.
- Concurrency tests pass consistently.

## [x] tkt-004: Update docs for tool-first extension behavior

### Scope

- Update `README.md`, `docs/commands.md`, and `docs/architecture.md`.
- Keep hidden aliases undocumented.
- Update package-resource/doc alignment tests if needed.

### Acceptance criteria

- Docs describe agent-facing `notes_*` tools plus `/notes`/CLI fallback.
- Architecture docs mention `pi.registerTool()` and tool adapter behavior.
- Full validation suite passes.

## Final validation

Run and record:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
