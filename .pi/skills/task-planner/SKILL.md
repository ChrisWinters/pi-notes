---
name: task-planner
description: Create and manage a plan or spec, prd, stories, and tickets ensuring reliable, iterative execution. Use this skill when asked to plan out changes or create specs for a task, project, or idea.
user-invocable: true
license: MIT
metadata:
  tags: plan, spec, prd, stories, tickets
  author: ChrisWinters
  version: "3.2.0"
---

# Task Planner

Execute work through `.pi/tasks/active/<plan-slug>/` plans, keep plan state accurate, validate ticket structure, update agent docs on final reconciliation, and commit each completed ticket slice.

Manage execution through plan files in `.pi/tasks/`.

## Core model

Humans steer.

Agents execute.

Assume process/state gaps before prompt gaps:

- missing plan files
- stale ticket state
- missing validation evidence
- unclear repository constraints

## Repository structure

Use these locations:

- `.pi/tasks/tasks.yaml`
  - simple active plan index
  - shape: `active: []`
- `.pi/tasks/project/`
  - project context, research, references, notes, and idea material
  - not a plan contract source
- `.pi/tasks/active/<plan-slug>/`
  - active execution plan
- `.pi/tasks/completed/<plan-slug>/`
  - completed plan history

### Rules

- Do not reference `.pi/tasks/project/` files directly inside plan files by default. They may move.
- Only use project context files when the user explicitly asks you to use specific files.
- Even then, do not treat those file paths as durable links in other planning artifacts.
- When creating a new active plan directory, add only the plan slug to `.pi/tasks/tasks.yaml` under `active`.
- Keep `.pi/tasks/tasks.yaml` simple; store slugs only, not full paths.
- Commit new active task plan using the `git-commit` skill.

## Active plan files

### Pre-spec planning file: `plan.md`

When the user asks to plan (or create a plan) for a new change/update/feature, you may create:

- `.pi/tasks/active/<plan-slug>/plan.md`

`plan.md` is a pre-spec planning workspace used for:

- early research
- solution exploration
- notes and references
- open questions and assumptions

Rules for `plan.md`:

- When creating `.pi/tasks/active/<plan-slug>/`, add `<plan-slug>` to `.pi/tasks/tasks.yaml` under `active`.
- `plan.md` is only created when the user asks for a plan.
- `plan.md` is created before `spec.md` when deeper planning is needed.
- `plan.md` is **not required** to create `spec.md`.
- If `plan.md` exists, use it as context when creating `spec.md`, `prd.md`, `stories.md`, and `tickets.md`.
- Other files may exist in `.pi/tasks/active/<plan-slug>/` during planning, and `plan.md` may reference those plan-local files.

### Required execution files

Every active plan must contain these execution files before implementation starts. When the user asks to spec out tasks or create a spec, create an active spec plan and add `<plan-slug>` to `.pi/tasks/tasks.yaml` under `active`:

- `.pi/tasks/active/<plan-slug>/spec.md`
- `.pi/tasks/active/<plan-slug>/README.md`
- `.pi/tasks/active/<plan-slug>/prd.md`
- `.pi/tasks/active/<plan-slug>/stories.md`
- `.pi/tasks/active/<plan-slug>/tickets.md`

### `spec.md` as master execution context

`spec.md` is the master execution context for the plan.

It should be context-rich and include:

- goal and scope
- constraints and non-goals
- relevant code paths
- implementation details and approach
- examples/references needed for execution
- risks and open questions

`prd.md`, `stories.md`, and `tickets.md` are derived from `spec.md`.

### Detailed spec guidance

When creating or substantially revising `spec.md`, consult these optional support files to strengthen the spec before deriving `prd.md`, `stories.md`, and `tickets.md`:

- `.pi/skills/task-planner/references/detailed-spec-guide.md`
  - use as a quality guide for stronger specs, including goals/non-goals, contracts, lifecycle/state, safety, observability, failure behavior, validation, and definition of done
- `.pi/skills/task-planner/references/detailed-spec-template.md`
  - use as a section template when the work is large, risky, cross-cutting, integration-heavy, or underspecified

Rules:

- Treat these files as guidance, not mandatory structure for every plan.
- Scale the level of detail to the task size and risk.
- Prefer source-anchored, testable spec content over generic planning prose.
- Do not copy unused template sections into `spec.md`; include only sections that improve execution clarity.
- Ensure tickets derive from the finalized `spec.md` contracts, validation matrix, risks, and definition of done.

## Ticket structure

Use a ticket folder per ticket in the plan root:

- `tkt-001/`, `tkt-002/`, ...

Each ticket folder should include:

- `notes.md` (implementation notes and decisions)
- `evidence.md` (validation commands/results)
- optional `gaps.md` (ticket-local unresolved gaps)
- optional supporting files that the tickets reference

See example:

- `.pi/skills/task-planner/references/example-ticket-structure.md`

## Slice workflow

For each ticket-sized slice:

1. Read plan/spec files from `.pi/tasks/active/<plan-slug>/`.
2. Implement the bounded change.
3. Update ticket docs (`notes.md`, `evidence.md`, optional `gaps.md`).
4. Update plan-level state files when status changes.
5. Run plan validation script.
6. Commit the completed ticket slice using the `git-commit` skill.
7. Continue to the next ready ticket.

## Validation discipline

Use the task-planner validation script before closing a ticket and before final plan completion.

Script:

- `.pi/skills/task-planner/validate-active-plan.sh`

What it validates:

- target active plan exists under `.pi/tasks/active/`
- required execution files exist: `spec.md`, `README.md`, `prd.md`, `stories.md`, `tickets.md`
- ticket IDs in `tickets.md` (`tkt-###`) have matching folders
- each ticket folder has `notes.md` and `evidence.md`

Notes:

- `plan.md` is optional and is not required by the validator.

Usage examples:

```bash
# Validate when exactly one active plan exists
bash .pi/skills/task-planner/validate-active-plan.sh

# Validate a specific active plan slug
bash .pi/skills/task-planner/validate-active-plan.sh 2026-04-18-example-plan
```

## Commit discipline

Rules:

- commit after creating a plan file(s)
- commit after creating spec plan files
- commit after each completed ticket-sized slice
- include plan state updates in the same commit
- do not batch unrelated slices unless explicitly requested
- use the `git-commit` skill to produce repository-compliant commit subjects
- do not push unless explicitly asked

## Blocking and reconciliation

If blocked:

- update ticket state immediately
- record blocker details and evidence
- do not mark blocked work as complete

If docs/code/plan disagree:

- reconcile plan files before closing the ticket

## Final ticket workflow (required)

The final ticket must perform full reconciliation against:

- `spec.md`
- `prd.md`
- `stories.md`
- `tickets.md`

Then:

1. Use the `agent-docs` skill (aka “agents-docs” in team shorthand).
2. Update `docs/agent-docs.yaml` with durable outcomes from the completed plan.
3. Re-run `bash .pi/skills/task-planner/validate-active-plan.sh <plan-slug>`.

If gaps remain:

- document them in `gaps.md`
- notify the user and propose follow-up tickets

## Completion rule

When a plan is complete:

1. Confirm all tickets are done and validated.
2. Move the plan directory from:
   - `.pi/tasks/active/<plan-slug>/`
   to
   - `.pi/tasks/completed/<plan-slug>/`
3. Remove `<plan-slug>` from `.pi/tasks/tasks.yaml` `active`.
4. Commit the move and final updates using the `git-commit` skill.

Stop only when:

- plan is completed and moved
- remaining work is explicitly blocked
- user redirects priorities
