# Pi extension audit remediation

Status: specified
Manager: agent

This active task remediates the findings in `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/`.

## Execution order

1. `tkt-001` — secure storage roots and reject symlinks
2. `tkt-002` — coordinate mutations and honor cancellation
3. `tkt-003` — introduce typed outcomes and truthful tool contracts
4. `tkt-004` — recover truncated output and fix mode observability
5. `tkt-005` — align package, CI, and release contracts
6. `tkt-006` — reconcile documentation and run final validation

## Contracts

- Master specification: [spec.md](spec.md)
- Product requirements: [prd.md](prd.md)
- Stories and acceptance criteria: [stories.md](stories.md)
- Ticket checklist: [tickets.md](tickets.md)
- Planning context: [implementation.md](implementation.md)

Tickets must be executed in order unless their notes explicitly prove a dependency is already satisfied. Each ticket must update its own `notes.md` and `evidence.md` and leave the repository passing focused checks before commit.
