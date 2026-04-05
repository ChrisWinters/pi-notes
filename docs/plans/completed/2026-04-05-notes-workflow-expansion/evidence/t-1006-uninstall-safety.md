# T-1006 Uninstall Safety Evidence

Date: 2026-04-05
Ticket: `T-1006 — Implement /notes uninstall cleanup flow`

## Implemented behavior

- Added `/notes uninstall [--project] [--global]` handler.
- Default target with no scope flags: project directory only.
- `--global` targets global directory; both flags target both.
- Requires interactive UI confirmation before deletion.
- Uses storage helper `removeScopeDirectory(scope)` for recursive removal.

## Safety checks

- Non-interactive mode: command blocked (`requires an interactive UI session`).
- Confirmation includes explicit path summary before delete.
- Post-run summary reports removed vs already-absent directories.

## Test coverage

- `tests/commands.test.ts`
  - `refuses uninstall when UI is unavailable`
  - `uninstall defaults to project notes only`
  - `uninstalls global notes when --global is provided`
- `tests/storage.test.ts`
  - `removes a scope directory recursively`

## Result

✅ Destructive cleanup is explicit, confirm-gated, and scope-controlled.
