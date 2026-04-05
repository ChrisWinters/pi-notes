# T-006 Rewrite Preview + Confirm Evidence

Date: 2026-04-05
Ticket: `T-006 — Implement /notes rewrite preview + confirm flow`

## Delivered

- Implemented `/notes rewrite <name> <instruction>` in `src/commands/notes.ts`
- Added rewrite preview rendering in `src/ui/render.ts`
- Rewrite flow now requires explicit interactive approval before write

## Rewrite flow behavior

1. Resolve target note by scope selection.
2. Open proposal editor prefilled with current markdown.
3. Show rewrite preview (current vs proposed, first lines).
4. Ask for explicit confirmation (`Apply rewrite?`).
5. Write updated note only on confirm.
6. Refresh `updated` timestamp via storage write pipeline.

## Safety checks

| Scenario | Outcome |
|---|---|
| missing note | warning shown, no write | ✅ |
| missing instruction | error shown, no write | ✅ |
| no UI (`ctx.hasUI === false`) | blocked with explicit error | ✅ |
| user declines confirm | rewrite cancelled, no write | ✅ |
| user confirms | write applied and success message emitted | ✅ |

## Automated test evidence

- `tests/commands.test.ts`
  - rewrite apply path with preview + confirmation
  - rewrite cancellation path
  - rewrite missing-note path

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
