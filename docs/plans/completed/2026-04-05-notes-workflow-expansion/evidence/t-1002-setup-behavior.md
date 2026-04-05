# T-1002 Setup Behavior Evidence

Date: 2026-04-05
Ticket: `T-1002 — Implement /notes setup with starter global note`

## Implemented behavior

- Added `/notes setup` handler (`src/commands/handlers/setup.ts`).
- Added storage setup primitive (`NotesStorage.setupNotes`) with idempotent directory + starter-note creation.
- Added starter markdown generator (`renderSetupStarterNote`) in `src/commands/shared.ts`.

## Contract checks

- Ensures project notes directory: `<cwd>/.pi/notes`
- Ensures global notes directory: `~/.pi/notes`
- Creates `~/.pi/notes/note.md` only if absent
- Emits follow-up guidance: `Run /notes show note --global`

## Test coverage

- `tests/commands.test.ts`
  - `runs setup idempotently and provides follow-up guidance`
- `tests/storage.test.ts`
  - `runs setup idempotently and does not overwrite starter note`

## Result

✅ Setup command is idempotent and preserves existing starter content.
