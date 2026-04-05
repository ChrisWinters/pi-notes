# T-1007 Docs & Validation Consistency

Date: 2026-04-05
Ticket: `T-1007 — Docs + release checklist + full validation`

## Documentation updates completed

- `README.md`
  - command list expanded for setup/help/edit/move/uninstall
  - parser semantics updated for move flags
  - feature summary updated for setup + markdown editing
- `docs/commands.md`
  - syntax/examples/options updated
  - setup/edit/move/uninstall UX and no-UI behavior documented
- `docs/storage.md`
  - setup/lifecycle section added
  - move behavior + mutation guarantees documented
- `docs/security.md`
  - uninstall safety and no-UI restrictions documented
- `docs/release.md`
  - smoke test and checklist expanded for new command surface

## Validation gate

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅

## Result

✅ Durable docs and release checks align with implemented behavior.
