# Spec: pi-notes agent tools

## Goal

Register a safe, first-class `notes_*` custom tool surface in the `pi-notes` Pi extension so agents can execute common note operations through Pi tools, while preserving the existing `/notes` command and CLI behavior.

## Scope

Implement and validate these tools:

- `notes_setup`
- `notes_list`
- `notes_show`
- `notes_new`
- `notes_append`
- `notes_grep`
- `notes_rename`
- `notes_move`

Each tool must:

- be registered from the extension default export using `pi.registerTool()`;
- include a strict TypeBox parameter schema;
- include useful `description`, `promptSnippet`, and `promptGuidelines` metadata;
- reuse existing pi-notes command handlers/storage behavior rather than direct file mutation;
- return text content and structured details suitable for agent use and tests.

## Non-goals

- Do not add `notes_rm` or `notes_uninstall` tools.
- Do not add `notes_edit` or `notes_rewrite` tools.
- Do not alter the public `/notes` help output or README command list for this tool surface unless required by tests.
- Do not publish, reinstall, or modify global npm package state.
- Do not hand-edit generated `dist` output.

## Constraints

- Keep imports consistent with this package’s current Pi dependency: `@mariozechner/pi-coding-agent`.
- Use `typebox` for object schemas. If enum helper packages are unavailable or inconsistent, use a provider-compatible JSON-schema enum shape that does not rely on `Type.Union` of literals.
- Preserve existing parser semantics for scope flags, move destination flags, rename overwrite, and literal flag-like tokens.
- Mutating tools must route through the existing handlers/storage so atomic creation and mutation queues remain intact.
- Tool failure behavior must be observable. If command handlers emit error notifications, the tool adapter must expose `ok: false` in details and return a concise error message in content. Throw only for unexpected runtime failures or deliberately fatal adapter errors.

## Source/context paths

Executor should read these before implementation:

- `package.json`
- `src/index.ts`
- `src/commands/notes.ts`
- `src/commands/context.ts`
- `src/commands/parser.ts`
- `src/commands/shared.ts`
- `src/commands/handlers/index.ts`
- `src/core/storage.ts`
- `src/cli.ts`
- `skills/pi-notes/SKILL.md`
- `tests/commands.test.ts`
- `tests/parser.test.ts`
- `tests/storage.test.ts`
- `tests/cli.test.ts`
- Pi custom tool docs at `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`
- pi-tasks reference implementation at `/home/chris/Projects/pi-extensions/pi-tasks/src/index.ts`

## Implementation approach

### Tool names and exported helpers

Add stable exported helper functions for testability, following the local style used by pi-tasks:

- `getNotesSetupToolName(): "notes_setup"`
- `getNotesListToolName(): "notes_list"`
- `getNotesShowToolName(): "notes_show"`
- `getNotesNewToolName(): "notes_new"`
- `getNotesAppendToolName(): "notes_append"`
- `getNotesGrepToolName(): "notes_grep"`
- `getNotesRenameToolName(): "notes_rename"`
- `getNotesMoveToolName(): "notes_move"`

Also expose schema factory helpers if needed for enum compatibility tests, e.g. `createNotesScopeParameterSchema()` and `createNotesMoveDestinationParameterSchema()`.

### Parameter contracts

Use a common optional scope value for tools that accept scope:

- `scope?: "default" | "project" | "global"`

Map scope values to command argv:

- omitted or `default` -> no scope flag;
- `project` -> append `--project`;
- `global` -> append `--global`.

Tool-specific parameters:

- `notes_setup`: no parameters.
- `notes_list`: optional `scope`.
- `notes_show`: required `name`, optional `scope`.
- `notes_new`: required `name`, optional `scope`.
- `notes_append`: required `name`, required `text`, optional `scope`.
- `notes_grep`: required `query`, optional `scope`.
- `notes_rename`: required `fromName`, required `toName`, optional `scope`, optional `overwrite` defaulting false.
- `notes_move`: required `name`, required `destination: "project" | "global"`, optional source `scope`, optional `overwrite` defaulting false.

### Command adapter

Create a small adapter that executes a tool as command argv:

1. Build argv using the canonical subcommand (`setup`, `ls`, `show`, `new`, `append`, `grep`, `rename`, `move`).
2. Build a `NotesCommandContext` with:
   - `cwd: ctx.cwd`
   - `hasUI: false` unless a future tool needs confirmation (none in this slice)
   - `ui.notify()` capturing `{ message, level }`
   - `ui.confirm()` returning false
   - `ui.editor()` returning `undefined`
3. Call `handleNotesCommandArgv(argv, notesCtx)`.
4. Return:
   - `content[0].text`: joined captured messages, or a concise fallback such as `No output from notes command.`
   - `details`: `{ tool, argv, ok, messages }`, with `ok` false when any captured message has level `error`.

Do not parse or mutate files in the adapter.

### Tool registration metadata

Each tool should have a concise label and description. Prompt guidelines must name the tool explicitly, for example:

- `Use notes_list to list project or global pi-notes notes instead of shelling out to pi-notes.`
- `Use notes_show when the user asks to read or show a note and has provided or clarified the note name.`
- `Use notes_append when the user asks to add text to an existing note and scope is clear.`

### Skill update

Update `skills/pi-notes/SKILL.md` so the default routing is:

1. Use `notes_*` tools when available.
2. Ask one concise clarification question when note name or mutation scope is ambiguous.
3. Use `/notes ...` or CLI only as fallback when tools are unavailable.
4. Hand destructive delete/uninstall requests back to the user as explicit `/notes rm ...` or `/notes uninstall ...` commands.

Remove the old mandatory global-show handoff rule because `notes_show` is now intended for show/read requests.

## Validation matrix

| Area | Requirement | Evidence |
| --- | --- | --- |
| Tool names | All eight expected tool names are exported and registered | Unit tests |
| Tool schemas | Scope/destination schemas are provider-compatible enums, not literal unions | Unit tests |
| Tool execution | `notes_new` and `notes_show` create/read notes through handlers | Unit tests |
| Mutation routing | `notes_append` updates note content through handlers | Unit tests |
| Search/list | `notes_grep` and `notes_list` produce expected output | Unit tests |
| Move/rename | `notes_rename` and `notes_move` route overwrite and scope args correctly | Unit tests |
| Safety | Destructive tools are not registered | Unit tests |
| Skill | Skill documents tool-first usage and destructive handoff | File review/tests if available |
| Project | Lint/typecheck/test/build pass | Command output in ticket evidence |

## Definition of done

- All required `notes_*` tools are registered and tested.
- Existing `/notes` command and CLI tests still pass.
- `skills/pi-notes/SKILL.md` reflects tool-first behavior and prompt examples.
- No destructive note tools are exposed.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
- Ticket evidence is complete.
