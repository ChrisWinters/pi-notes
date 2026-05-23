# Brainstorm: pi-notes agent tools

## Original ask

User-provided brainstorm idea:

Create tool functions for the agent to use to run pi-tasks features. Use `~/Projects/pi-extensions/pi-tasks/docs/agent-docs.yaml` to explore the pi-tasks project on how it creates tool functions. Explore Pi extension documentation before development. The tool functions allow the agent to execute pi-notes commands on user request. Update `skills/pi-notes/SKILL.md` so the agent knows when and how to use the skill and prompts the user may use to instruct the agent to use a particular tool.

Lifecycle action selected: Create new brainstorm.

## Goal

Add first-class Pi custom tools to the `pi-notes` extension so agents can perform safe note operations directly through registered tools instead of shelling out to the CLI or manually reading/writing note files. Update the bundled `pi-notes` skill to prefer those tools and teach users/agents the prompt patterns that route to them.

## Current project context

- `src/index.ts` currently only registers the `/notes` command and delegates to `handleNotesCommand()`.
- `src/commands/notes.ts` exposes reusable `handleNotesCommand()`, `handleNotesCommandArgv()`, and `handleParsedNotesCommand()` around shared command parsing and handlers.
- `src/commands/context.ts` defines the minimal `NotesCommandContext` boundary: `cwd`, `hasUI`, `ui.notify`, `ui.confirm`, and `ui.editor`.
- `src/cli.ts` already creates a non-interactive command context and routes CLI argv through `handleNotesCommandArgv()`.
- `skills/pi-notes/SKILL.md` currently tells agents to prefer CLI flows for speed, execute some commands directly, and hand restricted commands back to users. This should change once custom tools exist.
- `docs/agent-docs.yaml` identifies command routing, parser, storage, and skill integration as the key refs.

## pi-tasks/tooling reference notes

From `~/Projects/pi-extensions/pi-tasks/docs/agent-docs.yaml` and `src/index.ts`:

- `pi-tasks` registers tools directly inside its extension default export with `pi.registerTool({ name, label, description, promptSnippet, promptGuidelines, parameters, execute })`.
- Tool names use stable snake_case names, e.g. `task_list_active`, `task_validate`, `task_global_sync`.
- Tool constants/getters are exported and covered by tests in `tests/basic.test.ts`.
- Tool parameters are TypeBox schemas; enum values use `StringEnum` from `@earendil-works/pi-ai` for provider compatibility.
- Tool execution uses `ctx.cwd` for project-local operations and returns `{ content: [{ type: "text", text }], details }`.
- Prompt metadata is important: `promptSnippet` puts tools in the system prompt, and `promptGuidelines` gives tool-first rules.

From Pi extension docs (`docs/extensions.md`, Custom Tools):

- Custom tools are registered with `pi.registerTool()` and are callable by the LLM.
- `promptSnippet` should be short and `promptGuidelines` must name the specific tool because guidelines are appended flat.
- Tool schemas should be strict; use `prepareArguments()` only for compatibility with older stored calls if needed.
- Throw errors to signal failed tool execution.
- Tools that mutate files should participate in safe mutation handling where relevant. For pi-notes, the existing `NotesStorage` already serializes note mutations internally, but implementation should still avoid bypassing storage.

## Candidate tool surface

A minimal safe set could mirror existing command use cases while preserving destructive/interactive guardrails:

- `notes_list` — list notes in project/global/default scope.
- `notes_show` — show a note by name and optional scope. This would replace the current skill's command handoff for show requests.
- `notes_new` or `notes_create` — create a note by name and optional scope.
- `notes_append` — append text to a note by name and optional scope.
- `notes_grep` — search notes by query and optional scope.
- `notes_rename` — rename a note with optional overwrite flag and scope.
- `notes_move` — move a note between project/global scopes with optional overwrite flag.

Destructive/interactive commands need extra care:

- `notes_rm` and `notes_uninstall` should likely stay out of the first tool set or require explicit confirmation semantics that are safe in agent context.
- `notes_edit` and `notes_rewrite` rely on editor/AI flows and may not fit the first tool set unless tool-specific contracts are designed.
- `notes_setup` may be safe and useful, but it creates directories and a starter note; decide during planning whether to expose it as `notes_setup` or keep setup as `/notes setup`.

## Design direction

- Implement tools in the extension package rather than as separate local harness tools.
- Prefer reusing existing command handlers/storage instead of duplicating note logic.
- A helper can adapt `handleNotesCommandArgv()`/`handleParsedNotesCommand()` into tool execution by building a `NotesCommandContext` whose `notify()` captures output and error levels for the returned tool result.
- Tool details should be structured enough for renderers/tests and future agents, e.g. action, scope selection, note name, output messages, and error status.
- Tool names should be stable, documented in tests, and exposed through getter functions like pi-tasks does.
- Keep README public command documentation focused on user slash/CLI commands unless a later plan explicitly documents agent tools.

## Skill update direction

Update `skills/pi-notes/SKILL.md` to:

- Prefer `notes_*` tools over CLI/shell flows when available.
- Map intents to tool names and clarify which prompts trigger each tool, such as:
  - "list project notes" -> `notes_list` with project scope.
  - "show global npm note" -> `notes_show` with global scope.
  - "append X to project daily note" -> `notes_append`.
  - "search notes for X" -> `notes_grep`.
- Keep clarification rules for ambiguous note name or mutation scope.
- Keep destructive safety rules; do not silently delete or uninstall.
- Fall back to `/notes ...` or CLI only when tools are unavailable.

## Acceptance ideas

- Extension registers pi-notes tools with prompt snippets/guidelines and strict TypeBox parameters.
- Tests prove expected tool names are exported/registered, similar to pi-tasks `tests/basic.test.ts`.
- Tool execution reuses existing note routing/storage and respects project/global scope behavior.
- Mutating tools preserve current note validation, atomic creation, and serialized mutation guarantees.
- `skills/pi-notes/SKILL.md` documents tool-first routing and user prompt examples.
- Validation passes: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.

## Non-goals for first implementation

- Do not add publishing, CI, or release automation.
- Do not bypass existing command parser/storage safety.
- Do not make destructive operations agent-executable without explicit safe confirmation design.
- Do not hand-edit generated `dist`; regenerate through `npm run build` only if build artifacts are part of the chosen workflow.
