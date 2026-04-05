# Plan: pi-notes MVP

- Plan slug: `2026-04-05-pi-notes-mvp`
- Status: completed
- Owner: Mr. Chris + agent support
- Created: 2026-04-05
- Completed: 2026-04-05
- Based on: `docs/plans/2026-04-05-pi-notes-mvp/outline.md`

## Objective

Build and publish an initial `pi-notes` extension for Pi that supports deterministic note workflows across project/global scopes, with strict code quality standards and an explicit AI rewrite flow.

## Scope (MVP)

- Package scaffold suitable for GitHub + npm publication
- Strict TypeScript + ESLint setup
- Deterministic command surface:
  - `/notes ls`
  - `/notes show <name>`
  - `/notes new <name>`
  - `/notes append <name> <text>`
  - `/notes rm <name>` (with confirmation)
  - `/notes grep <query>`
- AI-assisted update:
  - `/notes rewrite <name> <instruction>` with proposal preview and explicit confirmation
- Markdown + frontmatter storage in:
  - project: `.pi/notes/`
  - global: `~/.pi/notes/`

## Out of Scope (for MVP)

- Backlinks and graph features
- Automatic contextual note suggestions
- Weekly digest automation
- Multi-user/shared sync semantics

## Deliverables

- `package.json`, strict `tsconfig`, strict ESLint config, CI baseline
- Extension source structure (`src/*`) and test suite (`tests/*`)
- Public docs (`README.md`, `docs/*`, release guidance)
- Plan artifacts (`prd.md`, `stories.md`, `tickets.md`) kept current

## Success Criteria

1. Commands execute correctly in interactive Pi sessions.
2. Scope handling is explicit and safe.
3. Path traversal and unsafe names are blocked.
4. Delete and rewrite are guarded by explicit confirmation.
5. `lint`, `typecheck`, `test`, and `build` all pass with strict settings.
6. Repo is publication-ready for GitHub + npm.

## Risks

- Over-scoping initial release
- Ambiguous command grammar if aliases are expanded too early
- Rewrite flow complexity (diff/preview UX)

## Mitigations

- Keep deterministic operations first-class
- Keep aliasing minimal and explicit
- Implement rewrite as opt-in with preview/confirm gate

## Validation Gate

Minimum gate before MVP complete:

- lint (0 warnings)
- typecheck (strict)
- tests (core behavior + edge cases)
- build
- manual smoke test of all commands in Pi
