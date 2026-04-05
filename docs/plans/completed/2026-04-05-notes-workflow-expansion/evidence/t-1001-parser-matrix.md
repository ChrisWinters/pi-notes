# T-1001 Parser Behavior Matrix

Date: 2026-04-05
Ticket: `T-1001 — Define command grammar and parser extensions`

## Summary

Extended parser output to include `moveSelection` flags while preserving existing scope-edge parsing and `--` literal semantics.

## Covered behaviors

| Scenario | Input | Expected parse result | Status |
|---|---|---|---|
| Existing append literal token behavior | `append daily keep --global token` | `subcommand=append`, args keep `--global` in middle, no forced scope | ✅ |
| Existing scope edge parsing | `--project append daily note --global` | both scope flags captured, args stripped to content | ✅ |
| Existing `--` literal handling | `grep -- --global` | `--global` treated as literal arg | ✅ |
| Move target flag parsing | `move test-note --to-global --project` | `moveSelection.toGlobal=true`, `scopeSelection.forceProject=true`, args=`[test-note]` | ✅ |
| Move middle token literal preservation | `move test-note keep --to-global token` | middle `--to-global` preserved as arg, `moveSelection.toGlobal=false` | ✅ |
| Move `--` separator literal handling | `move test-note -- --to-project --overwrite` | move flags after separator preserved as args | ✅ |
| Move target conflict capture | `move test-note --to-project --to-global` | both move target booleans true for downstream handler validation | ✅ |
| Non-move subcommand ignores move flags | `append daily --to-global` | move flags treated as literal args | ✅ |

## Files changed

- `src/commands/parser.ts`
- `tests/parser.test.ts`

## Validation executed

- `npm run test -- tests/parser.test.ts` ✅
- `npm run typecheck` ✅
