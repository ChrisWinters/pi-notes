# Brainstorm: pi-notes audit remediation

## Original ask

User-provided brainstorm idea:

Create a detailed brainstorm based on the audit findings: `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/README.md`. Start by reading all linked documents, then update the `brainstorm.md` in the order of the audit findings. Once done make a final pass to ensure all gaps are covered.

Lifecycle action selected: Create new brainstorm.

## Audit source

Audit index: `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/README.md`

Linked findings read in order:

1. `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/package.md`
2. `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/tools.md`
3. `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/concurrency.md`
4. `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/docs.md`

## Goal

Remediate Pi-extension audit findings so `pi-notes` aligns with current Pi package/tool documentation, has safer agent tool behavior, preserves deterministic note mutations under parallel tool execution, and documents the current tool-first extension contract accurately.

## Finding 1: package/runtime import alignment

### Audit summary

`package.json`, `src/index.ts`, and `tests/tools.test.ts` still use older `@mariozechner/*` imports and `@sinclair/typebox`, while the current Pi docs identify `@earendil-works/*` packages and `typebox` as the bundled/peer import surface.

The package manifest points Pi at source TypeScript:

```json
"pi": {
  "extensions": ["./src/index.ts"],
  "skills": ["./skills"]
}
```

That means extension imports must resolve in a production Pi package runtime, not only in this repo with dev dependencies installed.

### Desired remediation direction

- Migrate extension/runtime imports from `@mariozechner/pi-coding-agent` to `@earendil-works/pi-coding-agent` if the current installed Pi package provides that import path in this repo.
- Migrate TypeBox imports from `@sinclair/typebox` to `typebox` if available/compatible with project TypeScript config.
- Update `package.json` peer/dev dependencies to match the current documented Pi package surface.
- Verify package tests and build still pass after import/dependency changes.
- Add a package-load or import smoke test that catches dependency drift for the source TypeScript extension entry.

### Risks/notes

- This repo currently has `@mariozechner/pi-coding-agent` and `@sinclair/typebox` in `devDependencies`. The remediation must account for actual installable packages and lockfile state.
- If current docs and current npm package availability diverge, planning should explicitly choose either compatibility-preserving dual support or a staged migration.

## Finding 2: tool errors are returned as normal results

### Audit summary

The `notes_*` tool adapter captures command error notifications and returns a normal tool result with `details.ok === false`. Current Pi docs say tool failures should throw from `execute()` so Pi marks the result as failed (`isError: true`).

Affected paths:

- `src/index.ts`
- `src/commands/notes.ts`
- `tests/tools.test.ts`

### Desired remediation direction

- Change the notes tool adapter so captured error-level command notifications become thrown errors from tool `execute()`.
- Preserve useful error text in the thrown error message.
- Decide whether to keep `details.ok` for successful results only, or to remove/stop relying on it for errors.
- Update tests so duplicate create or other domain failures reject/throw instead of resolving with `ok: false`.
- Consider a lower-level handler path that can throw typed `NotesError` directly for tool execution while keeping `/notes` UI notifications unchanged.

### Risks/notes

- The `/notes` command and CLI should keep user-friendly notifications and exit behavior.
- Only custom tool execution needs Pi tool failure semantics.

## Finding 3: tool outputs are unbounded

### Audit summary

`executeNotesTool()` joins all captured messages without truncation. `notes_show`, `notes_list`, and `notes_grep` can return large note contents or result sets to the LLM. Current Pi docs say custom tools must truncate output.

Affected paths:

- `src/index.ts`
- `src/commands/handlers/show.ts`
- `src/commands/handlers/ls.ts`
- `src/commands/handlers/grep.ts`

### Desired remediation direction

- Use Pi's documented truncation utilities if available from the current import package.
- Apply truncation in the shared tool adapter before returning text content.
- Use a documented limit such as 50KB / 2000 lines, or import Pi defaults when possible.
- Include a clear truncation notice in tool output when content is shortened.
- Add tests for a large note/show or grep result to prove truncation happens.

### Risks/notes

- Truncation should affect agent tool output only; slash command and CLI output can remain full unless product requirements say otherwise.
- If importing current truncation utilities requires the same package-name migration as Finding 1, group those changes carefully.

## Finding 4: mutation queues are not consistently file-keyed

### Audit summary

`NotesStorage` has an internal mutation queue, but queue keys differ by operation:

- append: `append:${fileName}`
- move: `move:${fileName}`
- rename: `rename:${sourceFileName}->${destinationFileName}`
- write: `${scope}:${fileName}`

Parallel `notes_*` tool calls can mutate the same note via different queues, which can interleave append/move/rename/write operations.

Affected paths:

- `src/index.ts`
- `src/core/storage.ts`
- `src/commands/handlers/append.ts`
- `src/commands/handlers/move.ts`
- `src/commands/handlers/rename.ts`

### Desired remediation direction

- Refactor `NotesStorage` mutation serialization to use canonical file/scope keys consistently across all mutation operations.
- For single-note operations, queue by resolved note path or a stable scope/file identifier.
- For multi-file operations (`move`, `rename`), serialize source and destination in deterministic order.
- Consider using Pi's `withFileMutationQueue()` in the tool layer if available and compatible; however, storage-level serialization may be more complete because CLI and slash commands also mutate notes.
- Add concurrency regression tests for combinations such as append+move, append+rename, and concurrent destination overwrite conflicts.

### Risks/notes

- Need to avoid deadlocks if multi-key queueing is implemented.
- Storage currently supports default-scope fallback where source scope is not known until after reading. The implementation may need a two-phase approach: resolve source first, then perform queued mutation with a re-check.

## Finding 5: docs describe old command-first behavior

### Audit summary

The bundled skill now says it prefers `notes_*` tools, and `src/index.ts` registers eight custom tools, but public docs still describe command-first behavior and mention only `/notes` command registration.

Affected paths:

- `README.md`
- `docs/architecture.md`
- `docs/commands.md`
- `skills/pi-notes/SKILL.md`
- `src/index.ts`

### Desired remediation direction

- Update README bundled skill section to mention tool-first routing when tools are available, with `/notes`/CLI fallback.
- Update `docs/commands.md` to describe the custom tool surface separately from slash/CLI commands.
- Update `docs/architecture.md` module and data-flow sections to include `pi.registerTool()` and the notes tool adapter.
- Replace stale upstream links/package naming where practical.
- Add or update tests that assert package resource docs/skill guidance remain aligned.

### Risks/notes

- README should not expose deliberately hidden command aliases (`/notes add`, `/notes list`) from the prior task.
- Docs should distinguish user-facing slash/CLI commands from agent-facing tools.

## Cross-finding grouping ideas

### Possible implementation phases

1. **Package/import compatibility phase**
   - Update Pi package imports/dependencies and add package-load smoke coverage.
   - This may be prerequisite for using documented truncation utilities.

2. **Tool contract phase**
   - Make tool errors throw.
   - Add output truncation.
   - Update tests for error and truncation behavior.

3. **Storage concurrency phase**
   - Rework mutation queue keys.
   - Add concurrent mutation regression tests.

4. **Docs alignment phase**
   - Update README/docs/architecture/commands around tool-first behavior and current Pi docs.

### Validation expectations

All phases should end with:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Package/import work should also include a runtime/package-load smoke check if feasible.

## Final pass: gap coverage

The brainstorm covers all linked audit findings:

- package runtime dependency/import mismatch — covered in Finding 1;
- tool error signaling — covered in Finding 2;
- tool output truncation — covered in Finding 3;
- mutation queue concurrency — covered in Finding 4;
- documentation drift — covered in Finding 5.

No additional audit-linked gaps remain at brainstorm stage.
