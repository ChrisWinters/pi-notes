# tkt-001 evidence — Fix symlink-safe CLI entry detection

## Required evidence

- Root-cause confirmation notes.
- Regression test command/result.
- Active-plan validation command/result.

## Results

- 2026-05-03: Root-cause confirmed by inspecting `src/cli.ts`; old guard used raw string equality between `import.meta.url` and `process.argv[1]`.
- 2026-05-03: Added `isDirectCliEntry()` realpath comparison and regression coverage for symlinked executable paths.
- Command: `npm run test`
  - Result: PASS — 7 test files passed, 69 tests passed.
- Command: `bash .pi/skills/task-planner/validate-active-plan.sh 2026-04-30-pi-notes-shell-wrapper-noop`
  - Result: PASS — active plan structure valid.
