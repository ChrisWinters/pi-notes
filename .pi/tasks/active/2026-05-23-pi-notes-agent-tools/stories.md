# Stories: pi-notes agent tools

## Story 1: list and show notes

As a Pi user, I want to ask the agent to list or show notes so that I can inspect note state without leaving the conversation.

Acceptance criteria:

- “list project notes” routes to `notes_list` with project scope.
- “show global npm note” routes to `notes_show` with global scope and name `npm`.
- Tool output includes the same meaningful content as the corresponding `/notes` command.

## Story 2: create and append notes

As a Pi user, I want the agent to create a note or append text to one so that quick updates are captured safely.

Acceptance criteria:

- `notes_new` creates notes using existing storage validation.
- `notes_append` preserves literal content and existing parser semantics.
- Ambiguous mutation scope is clarified by the skill before tool use.

## Story 3: search notes

As a Pi user, I want the agent to search my notes so that I can find relevant entries quickly.

Acceptance criteria:

- `notes_grep` searches project/global/default scopes using existing handler behavior.
- No-hit and invalid-query output remains consistent with `/notes grep`.

## Story 4: organize notes

As a Pi user, I want the agent to rename or move notes so that I can keep note storage organized.

Acceptance criteria:

- `notes_rename` routes `fromName`, `toName`, optional scope, and overwrite correctly.
- `notes_move` routes destination, optional source scope, and overwrite correctly.
- Existing overwrite safety semantics are preserved.

## Story 5: safe boundaries

As a Pi user, I want destructive actions to remain explicit so the agent cannot silently delete notes.

Acceptance criteria:

- No `notes_rm` or `notes_uninstall` tools are registered.
- The skill hands delete/uninstall requests back as explicit `/notes ...` commands.

## Story 6: setup notes

As a Pi user, I want the agent to initialize notes storage when requested.

Acceptance criteria:

- `notes_setup` executes existing setup behavior.
- Output reports created/existing directories and starter note status.
