# Tickets: note template and hidden shortcuts

## tkt-001 — Update generated note templates

Goal: make default generated note content use h2 headings with spacing.

Scope:

- Update `createEmptyNoteMarkdown()` in `src/core/format.ts`.
- Update setup starter note rendering in `src/commands/shared.ts`.
- Update/add tests for exact heading and spacing behavior.
- Update stale tests that expect `# <title>`.

Acceptance criteria:

- New notes render frontmatter, blank line, `## <title>`, and a blank line after the heading.
- Setup starter note renders `## Welcome to notes` with spacing.
- Timestamp preservation tests pass with the new h2 heading.

Validation:

```bash
npm run lint
npm run typecheck
npm run test
```

## tkt-002 — Add hidden add/list aliases

Goal: add undocumented `add` and `list` shortcuts without expanding public help/docs.

Scope:

- Register `add` as an alias for `new`.
- Register `list` as an alias for `ls`.
- Add command tests for `/notes add` and `/notes list`.
- Add tests that help output and README omit `/notes add` and `/notes list`.

Acceptance criteria:

- `/notes add <name>` creates a note like `/notes new <name>`.
- `/notes list` lists notes like `/notes ls`.
- `NOTES_USAGE` and README do not expose hidden aliases.

Validation:

```bash
npm run lint
npm run typecheck
npm run test
```

## tkt-003 — Final validation and evidence

Goal: reconcile ticket evidence and run full project validation.

Scope:

- Update ticket notes/evidence.
- Run full validation.
- Confirm no unrelated changes are present.

Acceptance criteria:

- All ticket evidence is current.
- Full validation passes.

Validation:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
