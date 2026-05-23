# tkt-004 Evidence

Commands run:

```bash
npm run lint
# passed

npm run typecheck
# passed

npm run test -- tests/package-resources.test.ts
# passed: 1 test file, 4 tests
```

Documentation assertions added:

- Combined README/commands/architecture docs contain `notes_*`, `pi.registerTool`, and `tool-first`.
- Combined docs do not contain hidden aliases `/notes add` or `/notes list`.

Final build validation after all tickets:

```bash
npm run lint
# passed

npm run typecheck
# passed

npm run test
# passed: 8 test files, 83 tests

npm run build
# passed
```
