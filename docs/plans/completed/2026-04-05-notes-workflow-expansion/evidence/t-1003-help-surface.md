# T-1003 Help Surface Evidence

Date: 2026-04-05
Ticket: `T-1003 — Implement explicit help aliases`

## Implemented behavior

- Added `help` handler (`src/commands/handlers/help.ts`).
- Registered command aliases in handler map:
  - `help`
  - `commands`
- Kept `/notes` (no subcommand) usage output behavior.

## Usage contract updates

- `NOTES_USAGE` expanded to include:
  - `/notes`
  - `/notes help`
  - `/notes commands`
  - `/notes setup`
  - `/notes edit`
  - `/notes move ...`
  - `/notes uninstall ...`

## Test coverage

- `tests/commands.test.ts`
  - `shows usage for explicit help aliases`

## Result

✅ Help/discoverability paths are explicit and aligned with expanded command surface.
