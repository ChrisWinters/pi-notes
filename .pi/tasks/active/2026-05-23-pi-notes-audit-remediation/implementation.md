# Implementation plan: pi-notes audit remediation

## Goal and outcome

Bring `pi-notes` into alignment with the current Pi extension/package contract identified by the audit. The finished work should:

- load against the current documented Pi package import surface;
- make `notes_*` tool failures use Pi tool error semantics;
- truncate large agent-tool output before returning it to the model;
- serialize note mutations consistently enough to prevent parallel tool races;
- update project documentation to describe the current tool-first behavior accurately.

## Scope

In scope:

- `package.json` and lockfile/dependency updates needed for current Pi imports.
- `src/index.ts` tool adapter and Pi API imports.
- `src/core/storage.ts` mutation queue behavior and related tests.
- `tests/tools.test.ts` plus focused tests for package import/load, error signaling, truncation, and concurrency.
- `README.md`, `docs/commands.md`, and `docs/architecture.md` documentation alignment.
- Existing package resource tests where docs/skill expectations need adjustment.

Out of scope:

- Publishing, npm release automation, or CI changes.
- New destructive agent tools such as remove/uninstall/rewrite/edit.
- Public documentation of hidden slash aliases (`/notes add`, `/notes list`).
- Broad redesign of note command parsing or note markdown format unrelated to audit findings.

## Assumptions and risks

- Current Pi docs are treated as the target contract: `@earendil-works/pi-coding-agent` and `typebox` imports should be preferred if installable and compatible in this repo.
- If package availability or TypeScript compatibility blocks the import migration, record the blocker in task evidence/gaps and stop for human decision rather than inventing a compatibility shim.
- Tool truncation should apply to agent-facing custom tool results only; slash command and CLI output can remain full unless tests reveal shared behavior is simpler and safe.
- Storage-level mutation serialization is preferred over tool-only queueing because CLI, slash commands, and tools share storage behavior.
- Multi-file queueing must avoid deadlocks by acquiring keys in deterministic order.

## Source/context files to read during spec creation

Audit findings:

- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/package.md`
- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/tools.md`
- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/concurrency.md`
- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/docs.md`

Project files:

- `package.json`
- `package-lock.json`
- `src/index.ts`
- `src/commands/notes.ts`
- `src/commands/handlers/show.ts`
- `src/commands/handlers/ls.ts`
- `src/commands/handlers/grep.ts`
- `src/commands/handlers/append.ts`
- `src/commands/handlers/move.ts`
- `src/commands/handlers/rename.ts`
- `src/core/storage.ts`
- `tests/tools.test.ts`
- `tests/package-resources.test.ts`
- `README.md`
- `docs/commands.md`
- `docs/architecture.md`
- `skills/pi-notes/SKILL.md`

Pi docs to consult when implementing:

- `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md`
- `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`
- `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/json.md`

## Spec-ready chunks / suggested tickets

### Ticket 1: Align Pi package imports and dependency metadata

Objectives:

- Replace old Pi package imports in source/tests with the current documented import paths when available.
- Replace `@sinclair/typebox` usage with `typebox` if compatible.
- Update `package.json` dependency/peer dependency metadata and lockfile consistently.
- Add a package or extension import/load smoke test that fails when the source extension entry cannot resolve runtime imports.

Acceptance notes:

- Existing tool registration tests still pass.
- The smoke test exercises the same `./src/index.ts` entry listed in `package.json` `pi.extensions`, or otherwise documents why an equivalent runtime check was used.

### Ticket 2: Correct custom tool error signaling and output truncation

Objectives:

- Make `notes_*` tool execution throw when captured command notifications contain an error.
- Preserve clear error messages for the model/tool caller.
- Truncate returned tool text using current Pi truncation utilities or equivalent documented limits.
- Add tests proving domain failures reject/throw and large outputs are truncated.

Acceptance notes:

- Slash command error notifications remain user-friendly.
- Tool result semantics no longer rely on `details.ok === false` for failed executions.
- Truncation tests should not require huge fixtures beyond what is needed to exceed configured limits.

### Ticket 3: Make note mutation serialization file-consistent

Objectives:

- Refactor storage mutation queues so operations touching the same note serialize through common canonical keys.
- Cover append, write/new, move, rename, delete/remove where applicable.
- For move/rename with source and destination files, use deterministic multi-key queue acquisition.
- Add concurrency regression tests for representative race pairs.

Acceptance notes:

- Existing behavior around scope precedence, overwrite errors, and missing notes remains intact.
- Tests demonstrate deterministic outcomes or deterministic failures for parallel mutations.

### Ticket 4: Update documentation for tool-first extension behavior

Objectives:

- Update README bundled skill/package sections to describe `notes_*` tool-first routing with `/notes`/CLI fallback.
- Update `docs/commands.md` to separate slash/CLI commands from agent-facing tools.
- Update `docs/architecture.md` to include tool registration, the shared tool adapter, and current Pi docs links/package names.
- Keep hidden aliases undocumented.

Acceptance notes:

- Documentation references match implemented public behavior.
- Package resource tests continue to assert the packaged skill/docs are present and aligned.

## Dependencies and ordering

1. Ticket 1 should run first because current Pi imports may be needed for truncation utilities and tool types.
2. Ticket 2 should follow Ticket 1 and can stay mostly localized to `src/index.ts` and tool tests.
3. Ticket 3 can run after or partly in parallel conceptually, but should be implemented after Ticket 2 in this lifecycle to keep tool contract changes isolated from storage semantics.
4. Ticket 4 should run last so docs describe the final implemented behavior.

## Validation expectations

Required final validation:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Additional focused checks:

- Package/import smoke test passes.
- Tool error test proves failed note operations reject/throw from tool execution.
- Tool truncation test proves large output is shortened with a visible notice or marker.
- Concurrency tests cover at least two same-note mutation race scenarios.

## Human review gates

Stop for human review if:

- current documented package imports cannot be installed or resolved in this repo;
- migrating package names requires a breaking dependency strategy decision;
- Pi truncation utilities are unavailable and an equivalent local implementation would add non-trivial API surface;
- deterministic multi-key mutation queueing requires changing user-visible scope/overwrite semantics.

## Handoff notes for spec creation

Create execution specs/tickets in the same order as the audit findings and this implementation plan. Keep the package/tool/storage/docs changes separated enough that each ticket can be validated independently, but run the full validation suite before marking the task built.
