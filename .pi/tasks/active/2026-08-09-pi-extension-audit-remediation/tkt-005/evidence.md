# tkt-005 evidence

Status: complete

## Package evidence

- `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` — PASS; lockfile regenerated without installing scripts.
- `npm pack --dry-run --json --ignore-scripts` — PASS; package `@tribalnerd/pi-notes@1.0.0`, 149 files, 258,559 unpacked bytes.
- Dry-run test confirms source extension, extension entry, skill, README, LICENSE, compiled CLI/storage resources, and no packaged coding-agent/TypeBox `node_modules` runtime.
- `npm ls --depth=0 --json` — PASS.

## Focused tests

- `npm run test -- --run tests/package-resources.test.ts tests/workflows.test.ts` — PASS, 2 files / 9 tests.
- An initial dry-run assertion expected npm's older array JSON envelope; the fixture was corrected to accept both the current package-keyed envelope and prior array envelope.
- Workflow tests assert `npm ci`, intentional triggers, main-only manual route, tag checkout/version check, least privileges, provenance, and no `NPM_TOKEN`.

## Repository validation

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run test` — PASS, 12 files / 118 tests.
- `npm run build` — PASS.

## Fallow

- `fallow` executable unavailable; optional analysis skipped without installation.

## Safety

No npm publish, npm auth change, GitHub configuration change, or push occurred.

## Commit

This evidence is included with the ticket slice committed as `fix(package): align release and peer contracts`.
