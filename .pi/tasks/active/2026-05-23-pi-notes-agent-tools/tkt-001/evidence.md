# tkt-001 Evidence

## Validation

```bash
npm run lint
npm run typecheck
npm run test
```

Result: passed.

## Test coverage

- `tests/tools.test.ts` checks exported tool names.
- `tests/tools.test.ts` checks scope and destination schemas have direct `enum` arrays and no `anyOf`.
- `tests/tools.test.ts` exercises duplicate-create error handling and verifies `ok: false` details.
