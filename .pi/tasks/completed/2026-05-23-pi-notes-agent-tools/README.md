# pi-notes agent tools

This active task adds first-class `notes_*` Pi tools to the `pi-notes` extension so agents can safely run common note operations without shelling out to the CLI.

## Lifecycle context

- Brainstorm: `brainstorm.md`
- Implementation plan: `implementation.md`
- Execution contract: `spec.md`
- Product requirements: `prd.md`
- Stories: `stories.md`
- Tickets: `tickets.md`

## Execution order

1. `tkt-001` — implement tool adapter, schemas, and exported tool names.
2. `tkt-002` — register tools and add execution/registration tests.
3. `tkt-003` — update bundled skill guidance and run final validation.

## Validation

Required before build handoff:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
