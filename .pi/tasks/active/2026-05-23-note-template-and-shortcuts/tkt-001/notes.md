# tkt-001 Notes

## Summary

Updated generated note templates to use h2 headings with blank-line spacing.

## Changes

- `src/core/format.ts`: `createEmptyNoteMarkdown()` now renders a blank line after frontmatter followed by `## <title>` and a trailing blank line.
- `src/commands/shared.ts`: setup starter note now uses `## Welcome to notes` with a blank line after frontmatter.
- `tests/format.test.ts`: updated template and timestamp preservation expectations.
- `tests/commands.test.ts`: updated setup starter note expectation.

## Decisions

- Applied the default heading style to both newly created notes and the setup starter note for consistency with the brainstorm interpretation.
