# Spec: note template and hidden shortcuts

## Goal

Update pi-notes note creation defaults and command aliases so generated notes use an `##` first body heading with clear spacing, while `/notes add` and `/notes list` work as hidden shortcuts for `/notes new` and `/notes ls`.

## Scope

Implement:

- empty note template heading change in `src/core/format.ts`;
- setup starter note heading style alignment in `src/commands/shared.ts`;
- hidden alias registration in `src/commands/handlers/index.ts`;
- tests for exact template behavior, alias behavior, and help/README non-exposure.

## Non-goals

- Do not document `/notes add` or `/notes list` in README or `NOTES_USAGE`.
- Do not change note frontmatter fields.
- Do not change parser edge-flag semantics or content preservation.
- Do not change note storage paths, naming rules, deletion, setup side effects, or CLI entry detection.
- Do not add release/publish/CI changes.

## Constraints

- Aliases must reuse canonical handlers (`handleNew`, `handleLs`) rather than duplicating behavior.
- Help output must remain unchanged for public command lists except for template-related output if tests require it.
- Template expectations should be explicit enough to prevent regression:
  - frontmatter ends with `---`;
  - note body begins with a blank line followed by `## <title>`;
  - there is a blank line after the heading.
- Existing parser tests should continue to pass unchanged.

## Source/context paths

Executor should read:

- `src/core/format.ts`
- `src/commands/shared.ts`
- `src/commands/handlers/index.ts`
- `src/commands/notes.ts`
- `src/commands/handlers/new.ts`
- `src/commands/handlers/ls.ts`
- `tests/format.test.ts`
- `tests/commands.test.ts`
- `tests/parser.test.ts`
- `README.md`

## Implementation approach

### Template update

Change `createEmptyNoteMarkdown(title, updatedIso)` to call `renderNoteMarkdown()` with a body that starts with `\n## ${title}\n` or equivalent rendered markdown that produces:

```markdown
---
title: Example
updated: 2026-...
---

## Example
```

The resulting parsed body may start with a leading newline because `renderNoteMarkdown()` appends the body as a single line after the frontmatter delimiter. Tests should assert the final rendered markdown shape rather than rely only on loose `contains` checks.

Update `renderSetupStarterNote()` to use:

```markdown
---
title: note
updated: ...
---

## Welcome to notes

Use /notes new <name> to create notes.
...
```

### Hidden aliases

Update `NOTES_HANDLERS`:

- add `add: handleNew` next to `new`;
- add `list: handleLs` next to `ls`.

No changes should be needed in `parseNotesCommandInput()` or `parseNotesCommandArgv()`.

### Tests

Add/update tests to cover:

- `createEmptyNoteMarkdown()` exact heading/spacing contract.
- `withUpdatedTimestamp()` still preserves updated body with `##` heading.
- `/notes add <name>` creates a note and `/notes show <name>` shows the new `##` heading.
- `/notes list` lists notes like `/notes ls`.
- help output (`/notes`, `/notes help`, or `NOTES_USAGE`) does not include `/notes add` or `/notes list`.
- README does not include `/notes add` or `/notes list` in public command docs.

## Risks and assumptions

- Setup starter note is treated as default generated note content and should be aligned with the h2 heading style.
- Hidden aliases should still work through CLI and tools indirectly because all execution paths share `NOTES_HANDLERS`.
- README may mention aliases only if a future user-facing decision changes; this task requires non-exposure.

## Validation matrix

| Area | Requirement | Evidence |
| --- | --- | --- |
| Empty note template | First body heading is `## <title>` with blank-line spacing | Unit test |
| Setup starter template | Starter note uses `## Welcome to notes` with spacing | Unit test or command test |
| Add alias | `/notes add` creates notes like `/notes new` | Command test |
| List alias | `/notes list` lists notes like `/notes ls` | Command test |
| Hidden aliases | Help and README omit alias command entries | Tests |
| Regression | Parser/storage/CLI behavior unchanged | Existing tests |
| Project gates | lint/typecheck/test/build pass | Ticket evidence |

## Definition of done

- Template behavior is implemented and tested.
- Hidden aliases are implemented and tested.
- Public help/README command lists do not expose aliases.
- All tickets have notes/evidence.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
