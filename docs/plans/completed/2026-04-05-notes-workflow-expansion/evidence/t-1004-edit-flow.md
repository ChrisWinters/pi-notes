# T-1004 Edit Flow Evidence

Date: 2026-04-05
Ticket: `T-1004 — Implement markdown-preserving /notes edit`

## Implemented behavior

- Added `/notes edit <name> [--project|--global]` handler (`src/commands/handlers/edit.ts`).
- Uses `ctx.ui.editor` to edit full markdown content.
- Applies write via `storage.writeNote` (timestamp policy retained).
- Cancel path (`editor` returns `undefined`) is non-mutating.

## Test coverage

- `tests/commands.test.ts`
  - `edits markdown while preserving multi-line content`
  - `cancels edit when editor returns undefined`

## Result

✅ Markdown spacing/newlines/paragraphs are preserved through editor workflow.
