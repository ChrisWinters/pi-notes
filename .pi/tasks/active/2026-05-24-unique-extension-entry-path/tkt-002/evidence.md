# tkt-002 Evidence

## Files changed

- `tests/package-resources.test.ts`
- `docs/agent-docs.yaml`
- `docs/architecture.md`

## Validation

```bash
npm run lint
```

Result: passed.

```bash
npm run typecheck
```

Result: passed.

```bash
npm run test
```

Result: passed. Vitest summary: 8 test files passed, 83 tests passed.

```bash
npm run build
```

Result: passed.

```bash
npm pack --dry-run
```

Result: passed. Dry-run tarball contents included both:

- `extensions/pi-notes/index.ts`
- `dist/extensions/pi-notes/index.js`

## Notes

Full validation passed after test/context updates. Package dry-run confirmed the manifest-referenced source wrapper is included in npm package contents.
