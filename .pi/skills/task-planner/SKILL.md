---
name: task-planner
description: Work effectively in docs-native, agent-first repositories that use plan files as execution control. Use when implementing tasks through active plan tickets, validating each slice, updating durable docs, and committing completed slices with clear evidence.
---

# Task Planner

Use this skill when working in a repository that treats planning docs and durable documentation as part of the implementation system.

## Core model

Humans steer.

Agents execute.

When work stalls, assume a harness problem before a prompting problem:

- missing docs
- missing plan state
- missing validation
- wrong task runner
- missing environment capability
- weak repository boundaries

## Repo-first workflow

Treat repository docs as the system of record.

Start with the lightest set of docs that defines the real task contract, typically:

- `AGENTS.md`
- `docs/README.md` (if present)
- `docs/plans/active/index.md` (if present)
- the target plan folder in `docs/plans/active/`

Read only what is needed to execute correctly, then expand if uncertainty remains.

## Docs structure to follow

Use these repo areas intentionally:

- durable docs in `docs/`
  - product, architecture, workflow, operations, and team rules
- `docs/plans/active/<plan-slug>/`
  - active execution plans (commonly `README.md`, `prd.md`, `stories.md`, `tickets.md`)
- `docs/plans/completed/<plan-slug>/`
  - completed plan history and outcomes
- `docs/plans/templates/` (if present)
  - reusable planning structures

If the repo uses a different structure, follow the repo conventions and keep plan state authoritative.

## Plan location and naming convention

Use date-prefixed plan slugs:

- `docs/plans/active/<YYYY-MM-DD>-<slug>/`
- `docs/plans/completed/<YYYY-MM-DD>-<slug>/`

Example:

- `docs/plans/active/2026-04-05-pi-notes-mvp/`

Rules:

- new planning/spec work starts under `docs/plans/active/`
- root-level planning files are temporary scratch files only
- migrate temporary root planning docs (for example `outline.md`) into the active plan folder as soon as plan scaffolding exists
- when a plan is done, move its folder from `active` to `completed` without changing the slug

## Plan discipline

Use active plans as the execution control plane.

Rules:

- pick work from `docs/plans/active/` only
- treat the selected plan's `tickets.md` as ticket truth
- only work tickets marked ready (unless the user explicitly redirects)
- if a ticket becomes blocked, update `tickets.md` immediately with blocker + evidence
- if durable repository behavior changes, update durable docs in the same slice
- if plan state changes, update plan docs in the same slice
- continue until the current plan is complete, explicitly blocked, or the user redirects

## Task routing

Pick the lightest execution mode that can honestly complete the task.

Use repository-provided task runners/scripts when available (for example npm/pnpm task commands, Make targets, or project-specific runners).

Guidance:

- use safe/local repo flows for docs and code edits
- use interactive/local-infra flows when local services are required
- use hosted/proof flows only when external verification is needed

Do not force infra-heavy work through lightweight runners if correctness depends on local or hosted systems.

## Slice workflow

Treat each ticket-sized slice as a complete unit of work.

For each slice:

1. Read relevant plan files and durable docs.
2. Choose the right runner/entrypoint.
3. Decide whether specialized tools/MCP servers should be used.
4. Implement the bounded change.
5. Update plan state and evidence.
6. Update durable docs if shipped behavior/contracts changed.
7. Run the narrowest honest validation during iteration.
8. Run required final validation for the slice.
9. Commit the slice.
10. Continue to the next ready ticket.

## Commit discipline

Enforce intentional commits.

Rules:

- commit after each completed ticket-sized slice
- include plan/doc updates in the same commit when they changed
- do not batch unrelated slices into one commit unless explicitly requested
- use commit messages that reflect real outcomes
- do not leave completed slice work uncommitted when continuing
- do not push commits unless explicitly asked

## Documentation discipline

Update docs when repository contracts change.

Always update matching docs when you change:

- startup or validation entrypoints
- runner/task workflow behavior
- architecture or boundary rules
- deploy/recovery workflow
- plan structure or planning rules
- operator workflow expectations

Do not add docs churn when behavior has not changed.

## Validation discipline

Use the repository's actual checks, not memory.

Typical validation classes:

- docs validation
- typecheck
- lint
- tests
- architecture/boundary checks (if present)
- plan-status checks (if present)

Use surface-specific validation while iterating, then run the required broader gate before marking a slice complete.

## MCP/tooling guidance

Treat MCP/tool selection as part of the work loop.

For each slice, explicitly ask:

- does this task map to a purpose-built MCP/tool that reduces guessing
- would using it materially improve inspection, implementation, or validation

If yes, use it early.

Rules:

- prefer MCP/tools when they reduce uncertainty
- make an explicit tool choice per slice
- do not block progress if tooling is unavailable and repo source-of-truth is sufficient
- do not let tool output override repository architecture contracts

## Blocking and reconciliation

When work cannot continue:

- record the blocker in the active ticket
- include exact capability/environment gap
- include evidence
- do not mark blocked work as done
- continue another ready ticket only if plan + user intent allow

If docs, plan state, and code disagree:

- reconcile plan docs and durable docs before calling the slice complete

## Completion rule

Do not stop at partial implementation if the current slice can be carried through.

Default expectation:

- implement
- validate
- update docs and plan state
- commit
- continue to the next ready ticket

Stop only when:

- the active plan is complete
- remaining work is explicitly blocked
- the user redirects
