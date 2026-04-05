# T-004 Deterministic Command Behavior Evidence

Date: 2026-04-05
Ticket: `T-004 — Implement deterministic /notes commands (part 1)`

## Commands implemented

- `/notes ls`
- `/notes show <name>`
- `/notes new <name>`
- `/notes append <name> <text>`
- `/notes rm <name>` (confirm-gated)

## Behavioral checks

| Check | Outcome |
|---|---|
| `/notes new` defaults creation to project scope when no scope flag supplied | ✅ |
| `/notes show` resolves by configured default scope lookup | ✅ |
| `/notes append` updates existing note content and reports scope/file | ✅ |
| `/notes ls` lists note filenames with scope marker (`[project]` / `[global]`) | ✅ |
| `/notes rm` requires explicit confirmation in interactive mode | ✅ |
| `/notes rm` in non-interactive mode is blocked with explicit error | ✅ |

## Automated test evidence

- `tests/commands.test.ts`
  - create+show flow
  - append+list flow
  - rm blocked in non-interactive context
  - rm success when confirmed

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
