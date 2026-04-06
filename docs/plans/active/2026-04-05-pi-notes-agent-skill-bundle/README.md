# Plan: pi-notes Agent Skill + Extension Bundle

- **Slug:** `2026-04-05-pi-notes-agent-skill-bundle`
- **Status:** Active
- **Owner:** Agent
- **Created:** 2026-04-05

## Why this plan exists

Recent interaction showed ambiguity between:

- updating repository docs/files, and
- updating a pi-note (for example `~/.pi/notes/npm.md`).

This plan defines a deterministic, package-shippable approach so `pi-notes` can guide agent behavior with a bundled skill and (optionally) deterministic extension commands/tools.

## Scope

In scope:

- Spec and implement a bundled `pi-notes` skill focused on note intent routing.
- Ensure packaged resources expose the skill through normal package installation.
- Define deterministic decision flow for scope resolution (`global` vs `project`).
- Define confirm-gated mutation flow for note updates.
- Add documentation for end users and maintainers.

Out of scope:

- Reworking existing command grammar in breaking ways.
- Large refactors unrelated to note routing/intent safety.

## Deliverables

- Skill spec (intent patterns, path/scope resolution, ambiguity handling, safety flow).
- Implementation in package resource structure.
- Docs updates explaining how users get/use bundled skill(s).
- Tests (or validation evidence) for deterministic handling + safety checks.

## Execution map

- See `prd.md` for product/behavior contract.
- See `stories.md` for user stories + acceptance criteria.
- See `tickets.md` for ticket-level execution and status.
