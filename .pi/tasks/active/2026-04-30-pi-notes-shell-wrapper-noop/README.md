# 2026-04-30 pi-notes shell wrapper no-op

## Status

Ready for execution.

## Summary

Fix the package CLI entry-point guard so the installed `pi-notes` npm bin does not silently no-op when launched through a symlinked global bin path.

## Files

- `spec.md` — master execution contract.
- `prd.md` — product requirements derived from the spec.
- `stories.md` — user stories and acceptance criteria.
- `tickets.md` — ticket checklist for executor workflow.
- `tkt-001/` — implementation and regression coverage.
- `tkt-002/` — built wrapper validation and docs check.
- `tkt-003/` — final reconciliation and full validation.

## Execution handoff

Use `task-executor` on this active plan. Execute tickets in order and update each ticket's `notes.md` and `evidence.md` before marking it complete.
