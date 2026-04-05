# Tickets: pi-notes MVP

Status legend: `ready` | `in_progress` | `blocked` | `done`

## Pi alignment checklist (applies to all tickets)

Reference: `docs/references/pi-extensions.md`

- Use `pi.registerCommand("notes", ...)` for command entrypoint.
- Keep extension export shape compatible with Pi extension loader.
- Ensure extension is installable/discoverable in project-local Pi usage.
- Confirm-gated actions (`rm`, `rewrite apply`) must account for `ctx.hasUI` behavior.
- Document command-collision behavior (`/notes` may become `/notes:1` if duplicated).

## T-001 — Scaffold package and strict quality baseline
- Status: done
- Story: 1
- Goal: Create publish-ready package skeleton and quality gates.
- Scope:
  - create `package.json` with scripts (`lint`, `lint:fix`, `typecheck`, `test`, `build`, `prepublishOnly`)
  - add strict `tsconfig.json`
  - add strict ESLint config
  - add `.gitignore`, `README.md`, `AGENTS.md`, initial `docs/*` stubs
- Implementation targets:
  - `src/index.ts` extension entrypoint skeleton (`export default function (pi) { ... }`)
  - `package.json` with publish metadata + `type: "module"`
  - baseline docs: `docs/architecture.md`, `docs/commands.md`, `docs/storage.md`, `docs/security.md`, `docs/release.md`
  - CI starter workflow in `.github/workflows/ci.yml`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - Scaffold added: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `eslint.config.mjs`, `.github/workflows/ci.yml`
  - Source skeleton added under `src/`
  - Baseline docs + project policies added (`README.md`, `AGENTS.md`, `docs/*.md`)
  - Validation run completed locally on 2026-04-05

## T-002 — Implement core naming and path safety module
- Status: done
- Story: 2
- Goal: Safe note identity and path resolution.
- Scope:
  - slug/normalize note names
  - enforce `.md` extension internally
  - reject traversal, absolute paths, and invalid names
- Implementation targets:
  - `src/core/naming.ts`
  - typed error cases in `src/core/errors.ts`
  - tests in `tests/naming.test.ts`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - naming/path safety implementation in `src/core/naming.ts`
  - typed validation codes in `src/core/errors.ts`
  - expanded edge-case tests in `tests/naming.test.ts`
  - edge-case matrix: `docs/plans/active/2026-04-05-pi-notes-mvp/evidence/t-002-edge-case-matrix.md`

## T-003 — Implement storage layer with scope resolution
- Status: done
- Story: 2
- Goal: Reliable project/global note storage operations.
- Scope:
  - resolve note paths with default precedence (project -> global)
  - support `--project` and `--global` forcing behavior
  - create/read/write/delete/list helpers
  - update frontmatter `updated` timestamp on mutation
- Implementation targets:
  - `src/core/storage.ts` for path resolution + file operations
  - `src/core/format.ts` for markdown/frontmatter read-write
  - `tests/storage.test.ts` and `tests/format.test.ts`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - storage implementation in `src/core/storage.ts` (scope resolution + CRUD/list helpers)
  - markdown/frontmatter helpers in `src/core/format.ts` (parse/render/update timestamp)
  - expanded tests in `tests/storage.test.ts` and `tests/format.test.ts`
  - behavior matrix: `docs/plans/active/2026-04-05-pi-notes-mvp/evidence/t-003-storage-scope-matrix.md`

## T-004 — Implement deterministic `/notes` commands (part 1)
- Status: done
- Story: 3
- Goal: Ship deterministic read/create/update/delete basics.
- Scope:
  - `/notes ls`
  - `/notes show <name>`
  - `/notes new <name>`
  - `/notes append <name> <text>`
  - `/notes rm <name>` with confirmation
- Implementation targets:
  - `pi.registerCommand("notes", ...)` routing parser in `src/commands/notes.ts`
  - output formatter in `src/ui/render.ts`
  - UI confirm handling for `rm` with non-interactive fallback (`ctx.hasUI` behavior documented)
  - tests in `tests/commands.test.ts`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - deterministic command routing + scope flag parsing in `src/commands/notes.ts`
  - list/show rendering helpers in `src/ui/render.ts`
  - command coverage in `tests/commands.test.ts`
  - behavior matrix: `docs/plans/active/2026-04-05-pi-notes-mvp/evidence/t-004-command-behavior.md`

## T-005 — Implement deterministic `/notes` commands (part 2)
- Status: done
- Story: 3
- Goal: Add search and polish command UX.
- Scope:
  - `/notes grep <query>`
  - display scope marker (`[project]`/`[global]`)
  - error/empty-state UX consistency
- Implementation targets:
  - command handler extension in `src/commands/notes.ts`
  - search formatting in `src/ui/render.ts`
  - tests for query parsing and scope-specific results in `tests/commands.test.ts`
- Validation:
  - ✅ `npm run lint`
  - ✅ `npm run typecheck`
  - ✅ `npm run test`
  - ✅ `npm run build`
- Evidence:
  - grep command handling in `src/commands/notes.ts`
  - storage search helper in `src/core/storage.ts`
  - grep rendering in `src/ui/render.ts`
  - command coverage in `tests/commands.test.ts`
  - behavior matrix: `docs/plans/active/2026-04-05-pi-notes-mvp/evidence/t-005-grep-and-ux.md`

## T-006 — Implement `/notes rewrite` preview + confirm flow
- Status: ready
- Story: 4
- Goal: Safe AI-assisted mutation flow.
- Scope:
  - generate rewrite proposal from note + instruction
  - present preview/diff
  - require explicit approval before write
  - support cancel/no-op path cleanly
- Implementation targets:
  - rewrite subcommand handler in `src/commands/notes.ts`
  - deterministic apply stage using existing storage layer only after explicit approval
  - preview renderer in `src/ui/render.ts`
  - tests for approval, rejection, and missing-note cases
- Validation:
  - tests for approve/decline/missing-note scenarios
- Evidence:
  - test logs + sample rewrite transcript

## T-007 — Documentation completion and consistency pass
- Status: ready
- Story: 5
- Goal: Public-facing docs match implementation.
- Scope:
  - finish README install/usage sections
  - finalize docs: architecture, commands, storage, security, release
  - ensure examples reflect actual command grammar
- Implementation targets:
  - add "Pi compliance" note referencing `docs/references/pi-extensions.md`
  - include command-collision note (`/notes`, `/notes:1`) in docs
  - include non-interactive behavior notes for confirm-gated actions
- Validation:
  - docs reviewed against command behavior and tests
- Evidence:
  - docs checklist

## T-008 — Release prep and v0.1.0 readiness
- Status: ready
- Story: 5
- Goal: Confirm package is publicly releasable.
- Scope:
  - run full quality gate (`lint`, `typecheck`, `test`, `build`)
  - run manual smoke test in Pi
  - prepare changelog entry and release checklist
- Implementation targets:
  - release checklist doc (`docs/release.md`) with npm publish steps
  - changelog seed entry for `v0.1.0`
  - verification log for manual Pi command smoke test
- Validation:
  - all gates pass; no unresolved blockers
- Evidence:
  - command outputs, checklist completion, release notes draft
