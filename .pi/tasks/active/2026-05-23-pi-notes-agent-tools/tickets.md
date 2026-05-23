# Tickets: pi-notes agent tools

## tkt-001 — Tool adapter, schemas, and exported names (done)

Goal: create the shared infrastructure for pi-notes tools.

Scope:

- Add stable tool-name constants/getters for all planned tools.
- Add provider-compatible scope and destination schemas.
- Add a shared adapter that converts tool params to canonical command argv and executes through `handleNotesCommandArgv()` with a captured `NotesCommandContext`.
- Return structured details with tool name, argv, messages, and `ok` status.

Acceptance criteria:

- Tool-name getter tests pass.
- Schema tests prove enum-style schemas are provider-compatible.
- Adapter exposes handler-emitted errors as `ok: false` details.

Validation:

```bash
npm run lint
npm run typecheck
npm run test
```

## tkt-002 — Register tools and execution tests (done)

Goal: register the safe `notes_*` tools and prove representative behavior.

Scope:

- Register `notes_setup`, `notes_list`, `notes_show`, `notes_new`, `notes_append`, `notes_grep`, `notes_rename`, and `notes_move` from the extension.
- Add prompt snippets/guidelines that name each tool explicitly.
- Add a fake `ExtensionAPI` test to verify expected tools are registered and destructive tools are absent.
- Add representative execution tests for create/show, append/grep, list, rename, move, setup, and an error case.

Acceptance criteria:

- All expected tools are registered.
- No `notes_rm`, `notes_uninstall`, `notes_edit`, or `notes_rewrite` tools are registered.
- Tool execution reuses existing command behavior and passes tests.

Validation:

```bash
npm run lint
npm run typecheck
npm run test
```

## tkt-003 — Skill update and final validation

Goal: update agent-facing guidance and prove the package remains valid.

Scope:

- Update `skills/pi-notes/SKILL.md` to prefer `notes_*` tools over CLI/direct file access.
- Document prompt-to-tool mappings for list, show, new, append, grep, rename, move, and setup.
- Preserve clarification rules for ambiguous name/scope.
- Preserve destructive handoff rules for delete/uninstall.
- Run final full validation.

Acceptance criteria:

- Skill guidance matches final tool names and parameters.
- Skill no longer says global show requests must be handed off instead of using a tool.
- Full validation passes.

Validation:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
