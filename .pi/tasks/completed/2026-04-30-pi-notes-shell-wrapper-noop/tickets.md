# Tickets: pi-notes shell wrapper no-op

Execute in order. Mark a ticket done only after its validation evidence is recorded and active-plan validation passes.

## tkt-001 — Fix symlink-safe CLI entry detection

- [x] Inspect `src/cli.ts` direct-execution guard and confirm root cause.
- [x] Implement symlink-safe direct-entry detection without changing command grammar.
- [x] Add focused regression coverage for symlinked executable detection and import side-effect safety.
- [x] Run relevant validation, including at least `npm run test` and active-plan validation.
- [x] Update `tkt-001/notes.md` and `tkt-001/evidence.md`.

## tkt-002 — Validate built CLI and wrapper behavior

- [x] Run `npm run build` to generate current CLI output.
- [x] Verify `node dist/src/cli.js --help` prints usage and exits 0.
- [x] Verify symlink/global wrapper behavior with `pi-notes --help` when available, or a documented local symlink equivalent.
- [x] Update docs only if the public CLI contract or validation guidance needs clarification.
- [x] Run relevant validation, including active-plan validation.
- [x] Update `tkt-002/notes.md` and `tkt-002/evidence.md`.

## tkt-003 — Final reconciliation and completion readiness

- [x] Reconcile implementation against `spec.md`, `prd.md`, `stories.md`, and `tickets.md`.
- [x] Run full project gates: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- [x] Run active-plan validation.
- [x] Record any remaining gaps in `tkt-003/gaps.md`; if no gaps remain, say so in notes/evidence.
- [x] Update `tkt-003/notes.md` and `tkt-003/evidence.md`.
