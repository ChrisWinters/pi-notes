# Plan: pi-notes CLI Surface

- **Slug:** `2026-04-05-pi-notes-cli`
- **Status:** Completed
- **Owner:** Agent
- **Created:** 2026-04-05

## Why this plan exists

`pi-notes` currently depends on extension command flows for note operations. For deterministic automation and external scripting, the package should expose a first-class CLI surface that manages note operations without requiring direct access to raw note paths.

## Scope

In scope:

- Define a CLI command grammar for core note workflows (show/manage/update).
- Ensure cross-platform path resolution for global and project scopes.
- Keep destructive operations confirm-gated by default.
- Keep behavior aligned with existing `/notes` command semantics where practical.
- Document installation and usage for local and global package installs.

Out of scope:

- Breaking changes to existing `/notes` grammar without migration notes.
- Full rewrite of extension command architecture.

## Deliverables

- CLI spec (command grammar, scope flags, output/error contracts).
- Implementation tickets for command handlers and shared note services.
- Validation plan for lint/type/test/build + smoke scenarios.
- Docs updates covering examples and cross-platform behavior.

## Execution map

- See `prd.md` for product and technical contract.
- See `stories.md` for user-facing acceptance criteria.
- See `tickets.md` for execution slices and validation.
