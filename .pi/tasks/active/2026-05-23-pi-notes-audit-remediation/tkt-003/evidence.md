# tkt-003 Evidence

Commands run:

```bash
npm run lint
# passed

npm run typecheck
# passed

npm run test -- tests/storage.test.ts
# passed: 1 test file, 18 tests
```

Regression coverage added:

- Concurrent append and move for the same note both fulfill and preserve appended content after the move.
- Competing renames from the same source serialize so exactly one succeeds and the original source is removed without duplicate destinations.
