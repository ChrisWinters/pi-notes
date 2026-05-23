# Stories: note template and hidden shortcuts

## Story 1: generated note heading

As a note author, I want new notes to start with an h2 heading so that note content is visually subordinate to metadata/frontmatter context.

Acceptance criteria:

- New note markdown contains frontmatter, a blank line, `## <title>`, and a blank line after the heading.
- Timestamp updates preserve the h2 body heading.

## Story 2: setup starter note consistency

As a new pi-notes user, I want the starter note to follow the same heading style as other generated notes.

Acceptance criteria:

- `/notes setup` starter markdown uses `## Welcome to notes`.
- Starter note retains existing guidance text.

## Story 3: add shortcut

As a frequent notes user, I want `/notes add` to create a note so that the create command is easier to remember.

Acceptance criteria:

- `/notes add daily --project` creates `daily.md` in project scope.
- Behavior and errors match `/notes new`.
- `/notes add` is not shown in help or README command lists.

## Story 4: list shortcut

As a frequent notes user, I want `/notes list` to list notes so that browsing notes is easier to remember.

Acceptance criteria:

- `/notes list --project` lists project notes like `/notes ls --project`.
- `/notes list` is not shown in help or README command lists.

## Story 5: regression safety

As a maintainer, I want alias and template changes to avoid parser/storage regressions.

Acceptance criteria:

- Existing parser, storage, CLI, and command tests pass.
- Full validation passes.
