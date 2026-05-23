# Implementation Plan: note template and hidden shortcuts

## Goal and outcome

Update pi-notes note creation ergonomics with a friendlier default markdown body and two undocumented command aliases.

Expected outcome:

- Newly created notes start with an `##` heading instead of `#`.
- Generated default-note content has blank-line spacing before and after the first heading body content.
- `/notes add <name> ...` behaves exactly like `/notes new <name> ...` but remains hidden from public help/README command lists.
- `/notes list ...` behaves exactly like `/notes ls ...` but remains hidden from public help/README command lists.
- Tests cover the template and alias behavior.

## Scope

Implement the requested behavior in the existing command and formatting paths:

1. Update `src/core/format.ts` so `createEmptyNoteMarkdown()` renders frontmatter followed by an `## ${title}` first body heading with clear blank-line spacing.
2. Update `src/commands/shared.ts` so the setup starter note follows the same default heading style, unless implementation discovers setup starter content is intentionally separate.
3. Update `src/commands/handlers/index.ts` to add hidden aliases:
   - `add: handleNew`
   - `list: handleLs`
4. Update tests for formatting and command routing.
5. Keep `NOTES_USAGE`, `README.md`, and public command lists free of `/notes add` and `/notes list`.

## Non-goals

- Do not add aliases to README or help text.
- Do not change parser flag semantics.
- Do not change storage locations, naming rules, or destructive command behavior.
- Do not modify CLI shim/global install behavior.
- Do not add publishing, release, or CI changes.

## Assumptions and risks

- “Default note” includes both notes created via `/notes new` and the starter note created by `/notes setup`; applying the heading style to both is low risk and consistent.
- Existing tests expect `# <title>` in some places. These should be updated to the new `## <title>` contract rather than left permissive.
- `add` and `list` aliases should share the same handlers as `new` and `ls`; no parser changes are needed because subcommands are simple registry keys.
- The aliases should also work through CLI argv because CLI routes through the same command handler registry.

## Source/context files for spec creation

Read these before creating execution spec artifacts:

- `src/core/format.ts` — note markdown template and parsing/rendering helpers.
- `src/commands/shared.ts` — help text and setup starter note rendering.
- `src/commands/handlers/index.ts` — subcommand-to-handler registry.
- `src/commands/notes.ts` — unknown command handling and shared command execution.
- `tests/format.test.ts` — existing note template assertions.
- `tests/commands.test.ts` — command behavior tests.
- `tests/parser.test.ts` — parser behavior to preserve.
- `README.md` — public command list that should not expose hidden aliases.

## Suggested spec-ready chunks

### Chunk 1 — note template update

- Change empty note markdown to use `## ${title}` as the first body heading.
- Ensure the rendered markdown has a blank line between frontmatter and the heading and a blank line after the heading.
- Update setup starter note heading to `## Welcome to notes` with equivalent spacing.
- Update format/setup tests to assert exact or near-exact template shape.

### Chunk 2 — hidden aliases

- Register `add` as an alias for `new`.
- Register `list` as an alias for `ls`.
- Add command tests proving aliases behave like canonical commands.
- Add tests proving `NOTES_USAGE` omits `add` and `list`.
- Optionally assert README omits `/notes add` and `/notes list` if test coverage is straightforward.

### Chunk 3 — final validation

- Run full repository validation.
- Update ticket notes/evidence.
- Confirm no public docs/help list includes hidden aliases.

## Dependencies and ordering

1. Update template behavior first so canonical and alias-created notes share the new format.
2. Add aliases after template tests are adjusted.
3. Run tests and fix any stale heading expectations.
4. Run full validation.

## Validation expectations

Run before handoff:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Also run pi-tasks validation:

```text
task_plan_validate 2026-05-23-note-template-and-shortcuts
task_validate
```

## Human review gates

- Review exact blank-line interpretation if the implementation uncovers ambiguity. Proposed contract: frontmatter delimiter, blank line, `## heading`, blank line, then future body content.
- Review whether setup starter note should be excluded from the “default note” heading change if a product distinction is desired.

## Handoff to task-spec

Create execution-ready spec artifacts and tickets. Recommended tickets:

1. Update note template and setup starter-note heading tests.
2. Add hidden `add`/`list` aliases and non-exposure tests.
3. Final validation and evidence reconciliation.
