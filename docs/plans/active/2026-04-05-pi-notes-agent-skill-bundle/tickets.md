# Tickets: pi-notes Agent Skill + Extension Bundle

Legend: `pending` | `ready` | `in_progress` | `blocked` | `done`

## T1 — Spec skill behavior contract

- **Status:** done
- **Goal:** Define deterministic intent detection, scope/path resolution, safe mutation flow, and ambiguity handling.
- **Artifacts:**
  - `docs/plans/active/2026-04-05-pi-notes-agent-skill-bundle/prd.md`
  - `docs/plans/active/2026-04-05-pi-notes-agent-skill-bundle/stories.md`
  - `docs/plans/active/2026-04-05-pi-notes-agent-skill-bundle/pi-notes/SKILL.md`
  - `docs/plans/active/2026-04-05-pi-notes-agent-skill-bundle/extensions.md`
- **Evidence:** Plan docs created with acceptance criteria and explicit source references.

## T2 — Add bundled pi-notes skill to package resources

- **Status:** ready
- **Goal:** Place skill in package resource structure so install flow can load it.
- **Expected changes:**
  - Use `pi-notes/SKILL.md` as the canonical behavior source when creating packaged skill file(s).
  - Update package resource registration if required.
  - Ensure package resource/discovery behavior is checked against `extensions.md` guidance.
- **Validation:**
  - Verify skill discoverable in installed package context.

## T3 — Document installation and behavior

- **Status:** ready
- **Goal:** Update docs explaining that package includes skill(s), and how note-routing behavior works.
- **Expected changes:**
  - `README.md`
  - `docs/commands.md` and/or docs page covering note intent routing
  - reference that behavior is sourced from `pi-notes/SKILL.md`
  - reference extension/package constraints from `extensions.md` where relevant
- **Validation:**
  - Docs reflect actual package behavior and scope mapping.

## T4 — Add deterministic behavior tests/evidence

- **Status:** ready
- **Goal:** Validate ambiguous input handling and confirm-gated mutation flow.
- **Expected changes:**
  - tests for ambiguity prompts/routing (where test harness permits)
  - or smoke-test evidence if unit tests are not practical
  - map evidence back to `pi-notes/SKILL.md` sections
- **Validation:**
  - `npm run test`
  - evidence references in this ticket.

## T5 — Final quality gate for this slice

- **Status:** ready
- **Goal:** Run required repo checks before closing plan.
- **Validation commands:**
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
