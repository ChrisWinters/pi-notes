# Architecture (Draft)

`pi-notes` is a Pi extension organized into:

- `src/index.ts` — extension registration and command wiring
- `src/commands/` — slash command parsing and orchestration
- `src/core/` — naming, storage, formatting, and domain logic
- `src/ui/` — output formatting and confirmation-related UX helpers
- `src/types/` — shared domain types

Detailed architecture will be finalized during T-002 to T-004.
