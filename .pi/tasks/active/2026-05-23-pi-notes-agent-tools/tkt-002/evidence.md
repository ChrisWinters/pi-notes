# tkt-002 Evidence

## Validation

```bash
npm run lint
npm run typecheck
npm run test
```

Result: passed.

## Test coverage

- `tests/tools.test.ts` verifies exactly the expected safe tools are registered.
- `tests/tools.test.ts` verifies destructive/editor tools are absent.
- `tests/tools.test.ts` executes representative registered tools against temporary project/global note roots.
