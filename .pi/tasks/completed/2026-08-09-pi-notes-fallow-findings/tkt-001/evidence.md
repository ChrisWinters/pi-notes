# tkt-001 evidence — Correct adapter boundary zones

Status: complete

## Before

- Fallow 3.14.0 resolved 4 zones. `entry` matched three files and allowed only `entry` and `commands`.
- `dead-code --boundary-violations` reported 2 findings: `src/index.ts` imports from `src/core/mutation.ts` and `src/core/output-artifact.ts`.
- Boundary coverage findings: 0.

## After

- `fallow config` resolved 6 zones and the intended rules.
- `fallow list --boundaries` reported exact counts: package shim 1, Pi extension adapter 1, CLI adapter 1, commands 19, core 6, UI 1.
- `fallow dead-code --boundary-violations` reported `total_issues: 0`, `boundary_violations: 0`, and `boundary_coverage_violations: 0`.
- No inline suppression was added.

## Validation

- `npm run lint` — PASS.
- `python3 .pi/skills/agent-docs/scripts/validate_agent_docs.py` — PASS.
- `git diff --check` — PASS.
- `task_plan_validate` and focused `task_validate` passed before execution.

## Commit

Recorded by the repository commit with subject `chore(fallow): correct adapter boundary zones`.
