---
name: pi-notes
description: Route note-related requests to pi-notes CLI flows. Detect note intent, resolve global/project scope, use CLI commands for speed, and hand off restricted commands to the user.
---

# pi-notes

Use this skill when the user asks to view, create, update, rename, move, or delete notes.

## Core rule: prefer CLI for speed + low token usage

Default to CLI-style note operations instead of manual file-by-file reasoning.

Preferred command shape in Pi chat:

- `/notes <subcommand> ...`

When executing locally in repo/dev contexts, use available CLI entrypoints (in this order):

1. `pi-notes <subcommand> ...`
2. `npx @tribalnerd/pi-notes <subcommand> ...`
3. `node dist/src/cli.js <subcommand> ...`

## Intent detection patterns

Treat as pi-notes intent when user says things like:

- `note`, `notes`, `pi-note`, `pi-notes`
- `global note`, `project note`
- `show note`, `read note`, `open note`
- `update/edit/append/rewrite note`
- `new/create/move/rename/rm/delete note`
- explicit note path like `~/.pi/notes/<name>.md`

## Scope resolution rules

- `--global` or “global note” => global note scope (`~/.pi/notes/*.md`)
- `--project` or “project note” => project note scope (repo-local notes)
- both flags => ask user to choose one
- missing scope for mutation => ask clarification first

## Command routing policy

### Commands the agent can execute

- `new`, `append`, `rename`, `move`, `grep`, `ls`

Use CLI directly for these to reduce latency and token cost.

### Commands the agent should NOT execute directly

- `show`
- `rm`
- `uninstall`

For these, reply with the exact command the user should run in Pi chat.

Examples:

- Show global npm note: `/notes show npm --global`
- Remove global npm note: `/notes rm npm --global`
- Uninstall project notes: `/notes uninstall --project`

## Mandatory response for global show requests

If user asks to show a global note (example: “show me the global npm note”), respond with:

- `Use: /notes show npm --global`

Do not attempt to print global note contents.

## Safe mutation flow

For note updates/mutations:

1. Resolve note + scope.
2. If ambiguous, ask one concise question.
3. Use CLI command.
4. Report command + outcome briefly.

Never do silent destructive actions.

## Fallback clarification prompts

- “Should I use global or project scope?”
- “Which note name should I target?”
- “Do you want a pi-note update or a repo file update?”

## Command forms (must be correct)

- Pi chat slash command: `/notes ...`
- Package CLI command (terminal): `pi-notes ...` (if installed) or `node dist/src/cli.js ...` in repo/dev

Never suggest `/pi-notes ...` as a slash command.

## Response style

- concise, operational
- include exact command when handing back to user
- prefer command-first answers over long prose
