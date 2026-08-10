---
name: pi-notes
description: Route note-related requests through pi-notes tools first, resolving project/global scope safely and handing destructive commands back to the user.
---

# pi-notes

Use this skill when the user asks to view, create, update, search, rename, move, set up, or delete notes.

## Core rule: prefer pi-notes tools

When available, use registered `notes_*` tools instead of shelling out to the CLI or manually editing note files.

Tool-first mapping:

- `notes_setup` — set up or initialize pi-notes storage.
- `notes_list` — list/browse notes.
- `notes_show` — show/read/open a note by name.
- `notes_new` — create a new note by name.
- `notes_append` — append text to an existing note.
- `notes_grep` — search notes by query.
- `notes_rename` — rename a note.
- `notes_move` — move a note between project and global scopes.

Fallback only when tools are unavailable:

1. Pi chat command: `/notes <subcommand> ...`
2. Local CLI: `pi-notes <subcommand> ...`
3. Package CLI: `npx @tribalnerd/pi-notes <subcommand> ...`
4. Repo/dev CLI: `node dist/src/cli.js <subcommand> ...`

Never manually read or mutate note files when a tool or command can do the operation.

## Intent detection patterns

Treat as pi-notes intent when user says things like:

- `note`, `notes`, `pi-note`, `pi-notes`
- `global note`, `project note`
- `show note`, `read note`, `open note`
- `update/edit/append/rewrite note`
- `new/create/move/rename/rm/delete note`
- `setup notes`, `initialize notes`
- explicit note path like `~/.pi/notes/<name>.md`

## Scope resolution rules

Tool scope values:

- `project` => project notes under the host config directory (`.pi/notes/` on standard Pi)
- `global` => global notes under the host config directory (`~/.pi/notes/` on standard Pi)
- `default` or omitted => command default behavior

Rules:

- `--global` or “global note” => use `scope: global`.
- `--project` or “project note” => use `scope: project`.
- both flags/scopes => ask user to choose one.
- missing scope for an existing named note mutation (`notes_append`, `notes_rename`, `notes_move`) => check `notes_list` with `scope: project` and `scope: global` before asking.
  - If the note exists only in project scope, assume `scope: project`.
  - If the note exists only in global scope, assume `scope: global`.
  - If the note exists in both scopes, ask which note to use.
  - If the note exists in neither scope, ask whether to create it or clarify the name/scope.
- missing scope for new note creation (`notes_new`) => ask one concise clarification question unless the user clearly accepts default behavior.
- missing scope for read/search/list can use default behavior unless user asks for a specific scope.

## Prompt-to-tool examples

- “list project notes” -> `notes_list` with `scope: project`
- “show global npm note” -> `notes_show` with `name: npm`, `scope: global`
- “create a project note named daily” -> `notes_new` with `name: daily`, `scope: project`
- “append shipped release to daily” -> clarify scope if needed, then `notes_append`
- “search notes for release” -> `notes_grep` with `query: release`
- “rename project note foo to bar” -> `notes_rename` with `fromName: foo`, `toName: bar`, `scope: project`
- “move note foo to global” -> `notes_move` with `name: foo`, `destination: global`
- “set up notes” -> `notes_setup`

## Commands the agent should NOT execute as tools

There are no destructive note tools in the first tool surface.

For destructive requests, reply with the exact command the user should run in Pi chat:

- Delete/remove note: `/notes rm <name> [--project|--global]`
- Uninstall notes: `/notes uninstall [--project] [--global]`

Examples:

- Remove global npm note: `Use: /notes rm npm --global`
- Uninstall project notes: `Use: /notes uninstall --project`

Do not silently delete or uninstall notes.

## Safe mutation flow

For note updates/mutations:

1. Resolve note name and scope.
2. For existing named notes with missing scope, list both project and global scopes before asking; assume the only matching scope when exactly one match exists.
3. If ambiguous, ask one concise question.
4. Use the matching `notes_*` tool.
5. Report the outcome briefly.

For rename/move destination conflicts:

- Do not attempt an overwrite through `notes_rename` or `notes_move`; those tools intentionally expose no overwrite parameter.
- Return the tool's exact interactive `/notes ... --overwrite` handoff to the user.
- Only the user may run that destructive command and confirm the overwrite.

## Fallback clarification prompts

- “Should I use global or project scope?”
- “Which note name should I target?”
- “What text should I append?”
- “Do you want a pi-note update or a repo file update?”

## Command forms when falling back

- Pi chat slash command: `/notes ...`
- Package CLI command: `pi-notes ...` or `node dist/src/cli.js ...` in repo/dev

Never suggest `/pi-notes ...` as a slash command.

## Response style

- concise, operational
- include exact command when handing destructive actions back to the user
- prefer tool outcomes over long prose
