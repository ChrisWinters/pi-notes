# tkt-002 evidence — Validate built CLI and wrapper behavior

## Required evidence

- `npm run build` result.
- `node dist/src/cli.js --help` result.
- `pi-notes --help` or documented local symlink equivalent result.
- Active-plan validation command/result.

## Results

- Command: `npm run build`
  - Result: PASS — `tsc -p tsconfig.build.json` exited 0.
- Command: `node dist/src/cli.js --help >/tmp/pi-notes-direct.out 2>/tmp/pi-notes-direct.err`
  - Result: PASS — exit 0, stdout contained `Usage:`, stderr byte count was 0.
- Command: `chmod +x dist/src/cli.js; tmpdir=$(mktemp -d); ln -s "$PWD/dist/src/cli.js" "$tmpdir/pi-notes"; "$tmpdir/pi-notes" --help >/tmp/pi-notes-link.out 2>/tmp/pi-notes-link.err`
  - Result: PASS — exit 0, stdout contained `Usage:`, stderr byte count was 0.
- Command: `pi-notes --help >/tmp/pi-notes-global.out 2>/tmp/pi-notes-global.err`
  - Result: INFO — current global install remains outside this working tree and still no-ops (exit 0, no `Usage:`); local symlink equivalent above was used for validation because publishing/relinking is out of scope.
- Command: `bash .pi/skills/task-planner/validate-active-plan.sh 2026-04-30-pi-notes-shell-wrapper-noop`
  - Result: PASS — active plan structure valid.
