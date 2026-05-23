# tkt-002 Evidence

Commands run:

```bash
npm run lint
# passed

npm run typecheck
# passed

npm run test -- tests/tools.test.ts
# passed: 1 test file, 8 tests
```

Assertions added/updated:

- Duplicate `notes_new` execution now rejects with `Note already exists: dupe.md`.
- Large `notes_show` output includes `[Output truncated:` and omits the tail line beyond the limit.
