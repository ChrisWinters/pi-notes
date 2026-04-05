# T-003 Storage + Scope Resolution Matrix

Date: 2026-04-05
Ticket: `T-003 — Implement storage layer with scope resolution`

## Behaviors validated

| Behavior | Outcome |
|---|---|
| Default read resolves project first, then global fallback | ✅ |
| `createNote` supports explicit scope target | ✅ |
| Same note in both scopes resolves to project in default mode | ✅ |
| `listNotes` merges scopes with project precedence | ✅ |
| `appendToNote` updates frontmatter `updated` timestamp | ✅ |
| frontmatter parse/render helpers support tags and timestamp updates | ✅ |

## Test coverage added

- `tests/storage.test.ts`
  - create/read default scope
  - global fallback
  - project precedence on collisions
  - append mutation timestamp update
  - merged listing with de-duplication by filename
- `tests/format.test.ts`
  - parse/render roundtrip with tags
  - timestamp update helper behavior

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
