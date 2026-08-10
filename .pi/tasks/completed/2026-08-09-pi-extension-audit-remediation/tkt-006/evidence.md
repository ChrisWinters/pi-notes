# tkt-006 evidence

Status: complete

## Documentation validation

- `python3 .pi/skills/agent-docs/scripts/validate_agent_docs.py` — PASS: YAML, categories/order, date policy, and referenced paths.
- `npm run test -- --run tests/package-resources.test.ts tests/modes.test.ts tests/storage.test.ts tests/mutation.test.ts tests/tools.test.ts tests/workflows.test.ts` — PASS after restoring the documented literal `pi.registerTool` architecture anchor expected by the existing docs contract.
- `git diff --check` — PASS.

## Complete repository gate

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run test` — PASS, 12 files / 119 tests.
- `npm run build` — PASS; generated `dist/` refreshed.

## Smoke and package evidence

- `node dist/src/cli.js --help` — PASS; usage rendered.
- Isolated temporary HOME/project CLI create+show — PASS; project `.pi/notes/smoke-note.md` created and rendered, then temporary workspace removed.
- `npm pack --dry-run --json --ignore-scripts` — PASS; `@tribalnerd/pi-notes@1.0.0`, 149 files.
- Offline real-Pi print/JSON smoke coverage passes in `tests/modes.test.ts` without model credentials.
- Package extension import, symlink exploit regressions, mutation/cancellation, truthful tool outcomes, private output artifact, peer metadata, and workflow controls all pass in the full suite.

## Fallow

- `fallow` executable unavailable; optional analysis skipped without installation.

## Safety

No publish, push, npm authentication, GitHub configuration, or retained user-note change occurred. A first ad-hoc smoke invocation used the repository cwd; its uniquely created `smoke-note.md` fixture was immediately removed before the isolated smoke was rerun correctly.

## Commit

This evidence is included with the ticket slice committed as `docs(notes): reconcile remediated contracts`.
