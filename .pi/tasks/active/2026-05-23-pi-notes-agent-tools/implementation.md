# Implementation Plan: pi-notes agent tools

## Goal and outcome

Add a first-class tool surface to the `pi-notes` Pi extension so agents can execute safe note operations through registered Pi tools instead of shelling out to the CLI or manually reading/writing note files.

Expected outcome:

- The extension registers stable `notes_*` tools for common non-destructive note operations.
- Tools reuse existing pi-notes command parsing, handlers, storage validation, atomic create behavior, and serialized mutations.
- The bundled `skills/pi-notes/SKILL.md` is updated to route note requests tool-first and includes concrete user prompt patterns.
- Tests cover exported tool names, registration metadata, and representative tool execution.

## Scope

Implement the initial safe tool set:

1. `notes_list` — list notes with optional scope.
2. `notes_show` — show a note by name with optional scope.
3. `notes_new` — create a note by name with optional scope.
4. `notes_append` — append text to a note by name with optional scope.
5. `notes_grep` — search notes by query with optional scope.
6. `notes_rename` — rename a note with optional scope and overwrite option.
7. `notes_move` — move a note to project/global scope with optional source scope and overwrite option.
8. `notes_setup` — initialize project/global notes directories and starter note.

Use strict TypeBox schemas and provider-compatible enums for scope and destination values.

## Non-goals

- Do not expose destructive `rm` or `uninstall` as agent-executable tools in the first implementation.
- Do not expose editor/AI-dependent `edit` or `rewrite` as tools in this slice.
- Do not bypass existing command router, parser, handlers, or `NotesStorage` safety logic.
- Do not add publishing, CI, release automation, or global package reinstall behavior.
- Do not document hidden implementation-only details in README unless needed for user-facing package behavior.

## Assumptions and risks

- Existing command handlers are the correct behavior source of truth and can be adapted into tool execution by creating a `NotesCommandContext` that captures `notify()` output.
- Existing storage mutation queues are sufficient for note-level write serialization as long as tools reuse handlers/storage rather than direct file writes.
- Tool execution should mark errors clearly. Because current `handleParsedNotesCommand()` catches `NotesError` and emits an error notification, the tool adapter should convert captured error notifications into failed tool results or otherwise expose `ok: false` in details. Spec should decide exact failure contract.
- `notes_show` may reveal global note contents to the agent. This is now intended by the task, replacing the old skill handoff rule, but the skill should still respect explicit user scope and clarification rules.
- If tool registration test helpers need a mocked `ExtensionAPI`, keep the mock minimal and local to tests.

## Source/context files for spec creation

Read these before specifying implementation details:

- `src/index.ts` — extension registration point.
- `src/commands/notes.ts` — shared parsed/argv command execution.
- `src/commands/context.ts` — command context contract to adapt for tools.
- `src/commands/parser.ts` — scope/move flag semantics to preserve.
- `src/commands/shared.ts` — usage text and setup starter rendering.
- `src/commands/handlers/index.ts` — canonical handler registry.
- `src/core/storage.ts` — note safety, scope resolution, atomic creation, mutation queues.
- `src/cli.ts` — existing non-interactive command-context adapter pattern.
- `skills/pi-notes/SKILL.md` — skill routing instructions to update.
- `tests/commands.test.ts`, `tests/parser.test.ts`, `tests/storage.test.ts`, `tests/cli.test.ts` — existing test style and coverage.
- `/home/chris/Projects/pi-extensions/pi-tasks/src/index.ts` — custom tool registration reference.
- `/home/chris/Projects/pi-extensions/pi-tasks/tests/basic.test.ts` — exported name/schema test reference.
- Pi docs: `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`, especially Custom Tools.

## Suggested spec-ready chunks

### Chunk 1 — tool adapter and schemas

- Add exported constants/getters for tool names in `src/index.ts` or a small helper module.
- Define reusable scope parameter schema, likely optional enum: `default`, `project`, `global`.
- Define move destination enum: `project`, `global`.
- Create a helper that builds command argv from tool params and executes through `handleNotesCommandArgv()` with a captured `NotesCommandContext`.
- Return structured details including tool action, argv, messages, and whether an error-level notification occurred.

### Chunk 2 — register safe tools

- Register `notes_list`, `notes_show`, `notes_new`, `notes_append`, `notes_grep`, `notes_rename`, `notes_move`, and `notes_setup` with `pi.registerTool()`.
- Include `promptSnippet` and `promptGuidelines` that explicitly name each tool.
- Ensure parameter descriptions are concise and enough for agent use.
- Do not register `notes_rm`, `notes_uninstall`, `notes_edit`, or `notes_rewrite` in this slice.

### Chunk 3 — tests

- Add tests for exported tool names and provider-compatible schemas.
- Add tests with a fake `ExtensionAPI` to prove all planned tool names are registered.
- Add representative execution tests for:
  - `notes_new` then `notes_show` in project scope.
  - `notes_append` then `notes_grep`.
  - `notes_list` scope handling.
  - one mutation with conflict/error behavior, such as creating an existing note returns/throws a clear error.
- Add a test confirming destructive tools are not registered.

### Chunk 4 — skill update

- Rewrite `skills/pi-notes/SKILL.md` to prefer `notes_*` tools over CLI and direct file access.
- Map common user prompts to tool calls:
  - “list project notes” -> `notes_list` with `scope: project`.
  - “show global npm note” -> `notes_show` with `name: npm`, `scope: global`.
  - “create a project note named daily” -> `notes_new`.
  - “append shipped X to daily” -> `notes_append`.
  - “search notes for release” -> `notes_grep`.
  - “move note foo to global” -> `notes_move`.
  - “rename foo to bar” -> `notes_rename`.
  - “set up notes” -> `notes_setup`.
- Preserve clarification prompts for ambiguous name/scope and destructive safety handoffs for delete/uninstall.
- Include fallback guidance: use `/notes ...` or CLI only when tools are unavailable.

## Dependencies and ordering

1. Implement adapter/schemas first so all tools share one execution path.
2. Register tools and exported names next.
3. Add/adjust tests in parallel with registration.
4. Update skill after the final tool names and parameter contracts are stable.
5. Run full validation.

## Validation expectations

Run before handoff:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Also run pi-tasks validation for lifecycle artifacts:

```text
task_validate
```

## Human review gates

- Review the exact list of exposed tools before adding destructive or editor/AI-dependent operations in future work.
- Review whether `notes_show` access to global note contents is acceptable for all installed contexts.
- Review skill wording to ensure it does not encourage silent destructive actions.

## Handoff to task-spec

Create execution-ready spec artifacts and tickets from this plan. Recommended ticket grouping:

1. Tool adapter, schemas, exported names.
2. Tool registration and execution coverage.
3. Skill documentation update and final validation.
