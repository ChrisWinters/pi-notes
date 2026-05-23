# note template and hidden shortcuts

This task updates default generated note markdown and adds hidden command shortcuts.

## Artifacts

- Brainstorm: `brainstorm.md`
- Implementation plan: `implementation.md`
- Spec: `spec.md`
- PRD: `prd.md`
- Stories: `stories.md`
- Tickets: `tickets.md`

## Ticket order

1. `tkt-001` — update generated note templates and tests.
2. `tkt-002` — add hidden aliases and non-exposure tests.
3. `tkt-003` — run final validation and reconcile evidence.

## Required validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
