# Spec Coverage Check — pi-notes Fallow findings

Status: **Pass — ready for execution**
Reviewed: 2026-08-09
Task: `2026-08-09-pi-notes-fallow-findings`

## Reviewed artifacts

### Upstream context

- `brainstorm.md`
- `open-questions.md` — no open questions
- `implementation.md` — canonical plan handoff
- `.pi/tasks/audits/2026-08-09-pi-notes-fallow-audit/README.md`
- Linked audit `boundaries.md`, `duplication.md`, and `complexity.md`
- `plan.md` — absent by design; `implementation.md` is canonical
- `.pi/PI_TASKS_SPEC_CONTEXT.md` — absent; optional and non-blocking
- Root `gaps.md` — absent

### Execution artifacts

- `README.md`
- `spec.md`
- `prd.md`
- `stories.md`
- `tickets.md`
- `tkt-001` through `tkt-004` notes/evidence placeholders

## Coverage map

| Implementation/brainstorm requirement | Master spec coverage | Derived artifact/ticket coverage | Result |
| --- | --- | --- | --- |
| Truthful, narrow adapter boundaries | `spec.md` §§5.1, 6.1, 8, 10-13 | PRD requirements 1-2; Story 1; `tkt-001` | Covered |
| Separate package shim, Pi adapter, and CLI adapter without broad core access | `spec.md` §6.1 zone table and failure model | Story 1; `tkt-001` scope/acceptance/evidence | Covered |
| Interactive lookup/missing/UI preflight with explicit operation flow | `spec.md` §§5.2, 6.2, 7, 8 | PRD requirement 3; Story 2; `tkt-002` | Covered |
| Preserve plan's evidence-backed no-change option when extraction harms auditability | `spec.md` §§2, 6.2, 13-14 | PRD requirement 3; Story 2; `tkt-002` review/evidence | Covered after correction |
| Private exclusive no-follow primitive | `spec.md` §§5.3, 6.3, 7-8 | PRD requirement 4; Story 3; `tkt-002` | Covered |
| Preserve open flags, `0600`, errors, closure, queues, and source ordering | `spec.md` §§6.3, 7, 8, 10, 13 | Story 3; `tkt-002` acceptance/review gate | Covered |
| Add Vitest-compatible measured coverage and ignored JSON output | `spec.md` §§6.4, 8, 10-12 | PRD requirement 5; Story 4; `tkt-003` | Covered |
| Tests before complexity refactor | `spec.md` §6.5 ordered workflow | PRD requirements 6-7; Story 4; `tkt-003` conditional gate | Covered |
| Measured disposition for both moderate candidates | `spec.md` §§5.4, 6.5, 10, 14 | Story 4; `tkt-003` evidence contract | Covered |
| Do not split storage from hotspot score alone | `spec.md` §§3, 6.5, 12 | PRD non-requirement; `tkt-003` acceptance | Covered |
| Re-run all findings and clean categories | `spec.md` §§6.6, 10-11, 14 | PRD requirements 8-9; Story 5; `tkt-004` | Covered |
| Preserve public commands/tools/modes/scopes/outcomes | `spec.md` §§3, 7, 10 | PRD non-requirements; Stories 2-3; tickets 2-4 | Covered |
| No CI/publish/hooks/telemetry/baselines/generated output | `spec.md` §§3, 6.4, 7, 13-14 | PRD non-requirements; Story 5; tickets 3-4 gates | Covered |
| Required npm/package/Fallow/lifecycle validation | `spec.md` §§10-11, 14 | PRD success criteria; all ticket command blocks/evidence | Covered |
| Four independently reviewable ordered slices | `spec.md` §9 | README execution order; `tickets.md` dependencies | Covered |

## Validation-to-evidence coverage

- Boundary policy requires resolved config, boundary listing, violation counts, and coverage proof in `tkt-001/evidence.md`.
- Duplication requires focused public tests, safety source review, summary output, and both original traces in `tkt-002/evidence.md`.
- Complexity requires baseline/final measured coverage, exact uncovered branches, targeted tests, measured Fallow output, and package exclusion proof in `tkt-003/evidence.md`.
- Final reconciliation requires all npm checks, complete Fallow category summaries, package dry-run, generated-artifact checks, agent-docs validation, and lifecycle validators in `tkt-004/evidence.md`.
- Every Fallow command is constrained to JSON quiet output with stderr discarded and issue exits tolerated.

## Focused corrections made

The first comparison found one safely correctable mismatch: `implementation.md` and `brainstorm.md` permit a trace-backed no-change disposition if command preflight extraction demonstrably reduces auditability, while the initial spec made extraction unconditionally mandatory.

Corrected:

- `spec.md` now requires concrete evaluation and prefers extraction, but allows retention only with source/test/trace evidence, no suppression, and validator review.
- `prd.md`, `stories.md`, `tickets.md`, and `tkt-002/evidence.md` now carry the same narrow fallback.

No product behavior, scope, or implementation code was changed.

## Validation results

Before and after correction:

- `task_plan_validate({ slug: "2026-08-09-pi-notes-fallow-findings" })` — PASS, 0 warnings.
- `task_validate({ slug: "2026-08-09-pi-notes-fallow-findings" })` — PASS, 0 warnings.
- `git diff --check` — PASS.

## Unresolved findings

None. No `gaps.md` is required.

## Execution readiness

The spec is source-anchored, proportional to the audit, explicit about conditional complexity work and human review gates, and fully mapped to four ticket slices with focused evidence requirements. It is ready for `task-executor` after lifecycle transition to `ready`.
