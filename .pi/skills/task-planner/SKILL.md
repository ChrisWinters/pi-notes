---
name: task-planner
description: Create and maintain .pi/tasks plans, specs, PRDs, stories, tickets, and ticket scaffolds; use task-executor for active implementation.
user-invocable: true
license: MIT
metadata:
  tags: plan, spec, prd, stories, tickets
  author: ChrisWinters
  version: "3.6.0"
---

# Task Planner

Create and maintain `.pi/tasks/active/<plan-slug>/` planning artifacts. Use this skill for planning/specification. Use `task-executor` for ticket-by-ticket implementation and completion.

## Core model

Humans steer.
Agents plan and scaffold.
Agents execute through `task-executor`.

Assume process/state gaps before prompt gaps:

- missing plan files
- stale ticket state
- missing validation evidence
- unclear repository constraints

## Use when

- User asks to plan, spec, design, break down, or ticket work.
- User asks to create or revise `plan.md`, `spec.md`, `prd.md`, `stories.md`, or `tickets.md`.
- User asks for a "plan only", "planning only", "outline only", or otherwise explicitly limits output to planning.
- User asks to scaffold ticket folders.
- User asks to validate or repair active plan structure before execution.

## Do not use when

- User asks to execute, run, continue, finish, or complete an active plan.
- User asks to work the next ticket in `.pi/tasks/active/<plan-slug>/`.
- User asks to reconcile and close a plan after implementation.

For those requests, use `task-executor`.

## Repository structure

Use these locations:

- `.pi/tasks/tasks.yaml`
  - simple active plan index
  - shape: `active: []`
- `.pi/tasks/project/`
  - project context, research, references, notes, and idea material
  - not a plan contract source
- `.pi/tasks/active/<plan-slug>/`
  - active planning/execution contract
- `.pi/tasks/completed/<plan-slug>/`
  - completed plan history

### Rules

- Do not reference `.pi/tasks/project/` files directly inside plan files by default. They may move.
- Only use project context files when the user explicitly asks you to use specific files.
- Even then, do not treat those file paths as durable links in other planning artifacts.
- When creating a new active plan directory, add only the plan slug to `.pi/tasks/tasks.yaml` under `active`.
- Prefer the lifecycle helper when available: `.pi/skills/task-planner/task-state.sh add <plan-slug>`.
- After a successful add, refresh the Pi root task index when available: `npm --prefix /home/chris/Pi run tasks:sync`.
- Keep `.pi/tasks/tasks.yaml` simple; store slugs only, not full paths.
- Commit new active task plan or spec scaffolding using the `git-commit` skill.

## Active plan files

### Plan-only mode: `plan.md`

When the user asks for a "plan only", "planning only", "outline only", or otherwise explicitly limits output to planning, obey that boundary strictly.

Create only:

- `.pi/tasks/active/<plan-slug>/plan.md`

Do not create these files unless the user later asks to promote the plan into a spec or execution plan:

- `spec.md`
- `README.md`
- `prd.md`
- `stories.md`
- `tickets.md`
- ticket folders such as `tkt-001/`

In plan-only mode:

- Do not run active-plan validation, because `plan.md` alone is intentionally not execution-ready.
- Do not say the plan is ready for execution.
- End by saying the plan-only artifact is ready for review and can be promoted to a full spec/ticket plan on request.

`plan.md` is a pre-spec planning workspace for:

- early research
- solution exploration
- notes and references
- open questions and assumptions

Rules:

- When creating `.pi/tasks/active/<plan-slug>/`, add `<plan-slug>` to `.pi/tasks/tasks.yaml` under `active`.
- Use `.pi/skills/task-planner/task-state.sh add <plan-slug>` when the lifecycle helper exists; otherwise keep `.pi/tasks/tasks.yaml` as a simple active slug list.
- `plan.md` is only created when the user asks for a plan.
- If the user says "plan only" or equivalent, stop after `plan.md` and task-state/index updates.
- `plan.md` is created before `spec.md` when deeper planning is needed.
- `plan.md` is not required to create `spec.md`.
- If `plan.md` exists, use it as context when creating `spec.md`, `prd.md`, `stories.md`, and `tickets.md`.
- Other files may exist in `.pi/tasks/active/<plan-slug>/` during planning, and `plan.md` may reference those plan-local files.

### Required execution files

Every active plan must contain these execution files before implementation starts. When the user asks to spec out tasks or create a spec, create an active spec plan and add `<plan-slug>` to `.pi/tasks/tasks.yaml` under `active` with `.pi/skills/task-planner/task-state.sh add <plan-slug>` when available:

- `.pi/tasks/active/<plan-slug>/spec.md`
- `.pi/tasks/active/<plan-slug>/README.md`
- `.pi/tasks/active/<plan-slug>/prd.md`
- `.pi/tasks/active/<plan-slug>/stories.md`
- `.pi/tasks/active/<plan-slug>/tickets.md`

## `spec.md` as master execution context

`spec.md` is the master execution context for the plan.

It should be context-rich and include:

- goal and scope
- constraints and non-goals
- relevant code paths
- implementation details and approach
- examples/references needed for execution
- risks and open questions
- validation matrix
- definition of done

`prd.md`, `stories.md`, and `tickets.md` are derived from `spec.md`.

## Detailed spec guidance

When creating or substantially revising `spec.md`, consult these optional support files to strengthen the spec before deriving `prd.md`, `stories.md`, and `tickets.md`:

- `.pi/skills/task-planner/references/detailed-spec-guide.md`
- `.pi/skills/task-planner/references/detailed-spec-template.md`

Rules:

- Treat these files as guidance, not mandatory structure for every plan.
- Scale the level of detail to the task size and risk.
- Prefer source-anchored, testable spec content over generic planning prose.
- Do not copy unused template sections into `spec.md`.
- Ensure tickets derive from finalized spec contracts, validation matrix, risks, and definition of done.

## Ticket structure

Use a ticket folder per ticket in the plan root:

- `tkt-001/`, `tkt-002/`, ...

Each ticket folder should include:

- `notes.md` — implementation notes and decisions
- `evidence.md` — validation commands/results
- optional `gaps.md` — ticket-local unresolved gaps
- optional supporting files that the tickets reference

See:

- `.pi/skills/task-planner/references/example-ticket-structure.md`

## Planning workflows

### Plan-only workflow

When creating a plan-only artifact:

1. Choose a date-prefixed kebab-case `<plan-slug>`.
2. Create `.pi/tasks/active/<plan-slug>/`.
3. Create only `plan.md`.
4. Add the slug with `.pi/skills/task-planner/task-state.sh add <plan-slug>` when available.
5. Refresh the Pi root task index when `/home/chris/Pi` is available:

```bash
npm --prefix /home/chris/Pi run tasks:sync
```

6. Commit `plan.md` and task index updates using `git-commit` skill discipline.
7. Report that the plan-only artifact is ready for review, not execution.

### Spec/execution-plan workflow

When creating a new spec or execution-ready plan:

1. Choose a date-prefixed kebab-case `<plan-slug>`.
2. Create `.pi/tasks/active/<plan-slug>/`.
3. Create `spec.md`, `README.md`, `prd.md`, `stories.md`, and `tickets.md`.
4. Create ticket folders referenced by `tickets.md`.
5. Add `notes.md` and `evidence.md` to each ticket folder.
6. Run plan validation.
7. Add the slug with `.pi/skills/task-planner/task-state.sh add <plan-slug>` when available.
8. Refresh the Pi root task index when `/home/chris/Pi` is available:

```bash
npm --prefix /home/chris/Pi run tasks:sync
```

9. Commit the planning artifacts and local task index updates using `git-commit` skill discipline. If root sync changed `/home/chris/Pi/tasks.yaml` while you are not working in the Pi repo, report that external root-index update instead of silently ignoring it.

## Task state lifecycle helper

When installed, use this helper from the project root to update project-local active task state safely:

```bash
.pi/skills/task-planner/task-state.sh add <plan-slug>
.pi/skills/task-planner/task-state.sh complete <plan-slug>
```

Planning uses `add`. Completion is owned by `task-executor`.

Behavior:

- Updates only the current project's `.pi/tasks/tasks.yaml`.
- Uses a file lock and atomic rename for read-modify-write operations.
- Keeps updates idempotent.
- Validates slugs as path-safe values containing only letters, numbers, dots, underscores, and hyphens.
- Root `/home/chris/Pi/tasks.yaml` is derived data; refresh it with `tasks-manager` rather than editing it directly.
- When `/home/chris/Pi` is available, refresh root derived state after local task-state changes:

```bash
npm --prefix /home/chris/Pi run tasks:sync
```

## Validation discipline

Use the task-planner validation script before handing a plan to `task-executor`:

```bash
bash .pi/skills/task-planner/validate-active-plan.sh <plan-slug>
```

What it validates:

- target active plan exists under `.pi/tasks/active/`
- required execution files exist: `spec.md`, `README.md`, `prd.md`, `stories.md`, `tickets.md`
- ticket IDs in `tickets.md` (`tkt-###`) have matching folders
- each ticket folder has `notes.md` and `evidence.md`

Notes:

- `plan.md` is optional and is not required by the validator.

## Execution handoff

After planning/spec files are complete and validated, tell the user or next agent:

```txt
Plan is ready for execution. Use task-executor on .pi/tasks/active/<plan-slug>/.
```

Do not perform ticket-by-ticket implementation, final reconciliation, active-to-completed moves, or task-state completion through this skill. Those are `task-executor` responsibilities.

## Commit discipline

Rules:

- Commit after creating plan file(s).
- Commit after creating spec plan files.
- Include task index updates in the same commit.
- Use the `git-commit` skill to produce repository-compliant commit subjects.
- Do not push unless explicitly asked.

## Blocking and reconciliation

If planning docs disagree:

- reconcile plan files before marking the plan ready for execution
- record open questions in `spec.md` or ticket-local `gaps.md`
- do not claim the plan is execution-ready until required files validate

## Completion boundary

`task-planner` does not complete active plans. Completion requires `task-executor`, including:

- final implementation reconciliation
- `agent-docs` update when durable context changed
- move from `.pi/tasks/active/<plan-slug>/` to `.pi/tasks/completed/<plan-slug>/`
- `.pi/skills/task-planner/task-state.sh complete <plan-slug>`
- final commit
