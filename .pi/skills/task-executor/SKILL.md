---
name: task-executor
description: Execute active .pi/tasks plans ticket-by-ticket, maintain evidence, commit slices, reconcile final docs, move completed plans, and update task state.
user-invocable: true
license: MIT
metadata:
  tags: tasks, execution, tickets, plans
  author: ChrisWinters
  version: "1.1.0"
---

# Task Executor

## Purpose
Execute existing `.pi/tasks/active/<plan-slug>/` plans through bounded ticket slices, keep evidence current, commit each completed slice, reconcile final docs, move completed plans, and update project-local task state.

Use `task-planner` for creating or revising plans/specs. Use this skill for implementing them.

## Use when
- User says execute, run, continue, finish, or complete an active plan.
- User points at `.pi/tasks/active/<plan-slug>/` for implementation.
- User asks to work the next ticket in an active plan.
- User asks to reconcile and close a plan.

## Do not use when
- User only asks to create a plan, spec, PRD, stories, or tickets.
- User is still exploring scope and no active execution plan exists.
- Work is not tied to `.pi/tasks/active/<plan-slug>/`.

## Inputs to read
For the target active plan, read:

1. `.pi/tasks/active/<plan-slug>/README.md`
2. `.pi/tasks/active/<plan-slug>/spec.md`
3. `.pi/tasks/active/<plan-slug>/prd.md`
4. `.pi/tasks/active/<plan-slug>/stories.md`
5. `.pi/tasks/active/<plan-slug>/tickets.md`
6. Current ticket folder files:
   - `notes.md`
   - `evidence.md`
   - optional `gaps.md`

Read supporting source/docs paths named by the plan before editing code.

## Required plan structure
Active execution plans live at:

```txt
.pi/tasks/active/<plan-slug>/
```

Required plan files:

```txt
README.md
spec.md
prd.md
stories.md
tickets.md
```

Required ticket folders:

```txt
tkt-001/notes.md
tkt-001/evidence.md
tkt-002/notes.md
tkt-002/evidence.md
```

Validate with:

```bash
bash .pi/skills/task-planner/validate-active-plan.sh <plan-slug>
```

## Ticket execution workflow
For each ticket-sized slice:

1. Confirm working tree state before editing.
2. Read the plan files and the target ticket folder.
3. Pick the next ready unchecked ticket in `tickets.md`.
4. Implement only that bounded ticket scope.
5. Update the ticket's `notes.md` with decisions and changes.
6. Update the ticket's `evidence.md` with commands/results.
7. If blocked, update `gaps.md` and mark the ticket blocked; do not mark it complete.
8. Mark the ticket done in `tickets.md` only after validation passes.
9. Run:

```bash
bash .pi/skills/task-planner/validate-active-plan.sh <plan-slug>
```

10. Commit the completed slice using `git-commit` skill discipline.
11. Continue to the next ready ticket unless blocked or redirected.

## Commit discipline
- Commit after each completed ticket slice.
- Include plan state and ticket evidence updates in the same commit as the slice.
- Do not batch unrelated tickets unless explicitly requested.
- Use the `git-commit` skill for repository-compliant commit subjects.
- Do not push unless explicitly asked.

## Final ticket workflow
The final ticket must reconcile implementation against:

- `spec.md`
- `prd.md`
- `stories.md`
- `tickets.md`

Then:

1. Update final ticket `notes.md` and `evidence.md`.
2. Use `agent-docs` to update `docs/agent-docs.yaml` when durable project context changed.
3. Record remaining gaps in `gaps.md` if any.
4. Re-run:

```bash
bash .pi/skills/task-planner/validate-active-plan.sh <plan-slug>
```

## Completion workflow
A plan is complete only after all of these are done:

1. All tickets in `tickets.md` are marked done.
2. Final reconciliation is complete.
3. Active plan validation passes.
4. The plan directory is moved:

```bash
mkdir -p .pi/tasks/completed
mv .pi/tasks/active/<plan-slug> .pi/tasks/completed/<plan-slug>
```

5. Project-local active task state is updated.

Prefer the lifecycle helper when available:

```bash
.pi/skills/task-planner/task-state.sh complete <plan-slug>
```

Fallback only when the helper is unavailable: remove `<plan-slug>` from `.pi/tasks/tasks.yaml` manually, keeping the simple `active:` slug list shape.

6. Refresh the Pi root task index when `/home/chris/Pi` is available:

```bash
npm --prefix /home/chris/Pi run tasks:sync
```

This keeps `/home/chris/Pi/tasks.yaml` synchronized from all registered projects after the project-local task-state change. Root `tasks.yaml` remains derived data; do not hand-edit it.

7. Commit the completion move and task index updates. If root sync changed `/home/chris/Pi/tasks.yaml` while you are not working in the Pi repo, report that external root-index update instead of silently ignoring it.

## Hard stop rule
Do not report a plan complete while `<plan-slug>` remains in `.pi/tasks/tasks.yaml` and `.pi/skills/task-planner/task-state.sh` exists. When `/home/chris/Pi` is available, also refresh root state with `npm --prefix /home/chris/Pi run tasks:sync` before reporting completion.

Verify when closing:

```bash
if grep -q '<plan-slug>' .pi/tasks/tasks.yaml; then
  echo 'Plan slug still active; completion is not done.' >&2
  exit 1
fi
```

## Failure behavior
- Missing active plan directory: stop and report the missing path.
- Missing required execution files: run the validator and repair structure only when user intent allows.
- Missing ticket folder/docs: repair from `tickets.md` only when the ticket contract is clear.
- Validation failure: record evidence, do not mark ticket complete.
- Blocked implementation: update ticket state and `gaps.md`, then stop or ask for direction.
- Dirty working tree with unrelated changes: stop and ask before editing.
- Missing `task-state.sh`: use the documented manual fallback and record it in evidence.
- Moved plan but stale project task index: run the lifecycle helper or repair the project index before final commit.
- Project task state changed but root `/home/chris/Pi/tasks.yaml` is stale: run `npm --prefix /home/chris/Pi run tasks:sync` and report any external root-index change.

## Guardrails
- Keep changes scoped to the current ticket.
- Do not edit `.pi/tasks/project/` material unless explicitly requested.
- Do not treat `.pi/tasks/project/` paths as durable plan links.
- Do not skip ticket evidence.
- Do not skip the final task-state completion step.
- Do not push unless explicitly asked.

## Validation
Minimum validation before closing a ticket:

```bash
bash .pi/skills/task-planner/validate-active-plan.sh <plan-slug>
```

Final validation should also include project-specific tests from the ticket evidence and any relevant repo validation commands.
