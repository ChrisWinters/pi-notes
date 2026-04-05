# Project Skills

This directory contains project-local Pi skills.

## Included skills

- _None project-local currently._

## How to use

Ask Pi to use the skill explicitly in your prompt, for example:

- "Use the task-planner skill for this implementation."
- "Plan and execute this using docs/plans/active ticket discipline."

Pi may also auto-select the skill when your request matches its description.

## Expected project conventions

When using a planning skill (project-local or global), it works best when the repo has:

- `docs/plans/active/` for active plans
- `docs/plans/completed/` for completed plans
- a ticket source of truth (typically `tickets.md` inside each active plan)
- clear validation commands (lint/typecheck/test/docs checks)

## Plan naming convention

Use date-prefixed slugs:

- `docs/plans/active/<YYYY-MM-DD>-<slug>/`
- `docs/plans/completed/<YYYY-MM-DD>-<slug>/`

Example:

- `docs/plans/active/2026-04-05-pi-notes-mvp/`

## Suggested active plan structure

Inside each active plan folder:

- `README.md` — plan overview
- `prd.md` — requirements/intent
- `stories.md` — user stories/slices
- `tickets.md` — execution truth (status, blockers, evidence)

## Operating expectations (planning skills)

For each ticket-sized slice:

1. Read relevant plan/docs
2. Implement bounded change
3. Update plan/docs if contracts changed
4. Run honest validation
5. Commit slice
6. Continue to next ready ticket

## Notes

- Keep skills general unless the project requires strict custom rules.
- Prefer project-local skills (`.pi/skills`) for repo-specific workflows.
- If conventions change, update this README.
