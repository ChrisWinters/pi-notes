# Unique Extension Entry Path

This active task changes the pi-notes Pi package resource entry from the implementation file `src/index.ts` to a package-specific wrapper at `extensions/pi-notes/index.ts`.

## Current lifecycle artifacts

- `brainstorm.md` — original task idea and rough context.
- `implementation.md` — plan handoff.
- `spec.md` — execution contract.
- `prd.md` — product requirements.
- `stories.md` — user/developer stories and acceptance criteria.
- `tickets.md` — implementation tickets.

## Execution summary

Implement a thin wrapper entrypoint, update package manifest/package contents, ensure TypeScript and tests cover the wrapper, and update agent context if needed. Do not change `/notes` runtime behavior.

## Validation

Required final checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Optional package-content check:

```bash
npm pack --dry-run
```
