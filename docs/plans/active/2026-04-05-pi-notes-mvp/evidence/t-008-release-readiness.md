# T-008 Release Readiness Evidence

Date: 2026-04-05
Ticket: `T-008 — Release prep and v0.1.0 readiness`

## Quality gate

Executed locally:

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅

## Pi smoke run (CLI, extension loaded)

Environment:

- `pi` version: `0.65.0`
- Extension path: `/home/chris/Projects/pi-notes/src/index.ts`
- Temp cwd used: `/tmp/tmp.XAb5iQcpQG`

Commands executed (non-interactive print mode):

- `/notes new smoke-note` ✅
- `/notes append smoke-note hello-world` ✅
- `/notes show smoke-note` ✅
- `/notes grep hello-world` ✅
- `/notes rm smoke-note` ✅ (command handled; note remains due confirm-gated non-interactive behavior)
- `/notes rewrite smoke-note simplify` ✅ (command handled; no mutation due UI requirement)

Filesystem checks:

- `.pi/notes/smoke-note.md` exists after run ✅
- appended content `hello-world` present in note ✅

## Release artifacts updated

- `CHANGELOG.md` updated with current MVP surface
- `docs/release.md` updated with explicit readiness checklist

## Outstanding for final external release

- perform interactive smoke validation for confirm dialogs (`rm`, `rewrite`) in an interactive Pi session
- set final npm repository metadata before publishing (`package.json` URLs)
