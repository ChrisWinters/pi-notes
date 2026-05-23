# tkt-001 Evidence

## Validation

```bash
npm run lint
npm run typecheck
npm run test
```

Result: passed.

## Coverage

- `tests/format.test.ts` asserts exact empty note template shape.
- `tests/format.test.ts` verifies updated timestamp preserves `##` heading.
- `tests/commands.test.ts` verifies setup starter note uses `## Welcome to notes` with spacing.
