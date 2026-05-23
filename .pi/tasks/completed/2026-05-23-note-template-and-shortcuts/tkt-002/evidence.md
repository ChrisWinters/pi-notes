# tkt-002 Evidence

## Validation

```bash
npm run lint
npm run typecheck
npm run test
```

Result: passed.

## Coverage

- `tests/commands.test.ts` verifies `/notes add alias-note --project` creates a project note.
- `tests/commands.test.ts` verifies `/notes list --project` lists the note.
- `tests/commands.test.ts` verifies alias-created note uses the new `##` heading.
- `tests/commands.test.ts` verifies `NOTES_USAGE` and README omit `/notes add` and `/notes list`.
