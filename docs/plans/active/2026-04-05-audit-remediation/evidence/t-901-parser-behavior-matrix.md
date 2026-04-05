# T-901 Parser Behavior Matrix

Date: 2026-04-05
Ticket: `T-901 — Define option parsing contract and fix literal-flag bug`

## Parser contract implemented

- Scope flags (`--project`, `--global`) are parsed only at the **edges** of subcommand args:
  - leading args position
  - trailing args position
- Mid-content flag-like tokens are preserved as literal content.
- `--` end-of-options separator is supported to force all following tokens to be treated as literals.

## Verified behaviors

| Input | Expected | Outcome |
|---|---|---|
| `append daily keep --global token` | `--global` kept in content, no scope switch | ✅ |
| `append daily note --global` | trailing global scope option applied | ✅ |
| `grep -- --global` | query is literal `--global`, no scope option applied | ✅ |

## Tests added/updated

- `tests/parser.test.ts`
  - parser edge-flag parsing
  - literal token preservation
  - `--` separator behavior
- `tests/commands.test.ts`
  - regression test for append content containing `--global`

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
