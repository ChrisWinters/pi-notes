# Plan: Notes Workflow Expansion

- Plan slug: `2026-04-05-notes-workflow-expansion`
- Status: completed
- Owner: Mr. Chris + agent support
- Created: 2026-04-05
- Completed: 2026-04-05

## Objective

Expand `pi-notes` with usability and lifecycle commands requested from real-world testing:

1. markdown-friendly formatting workflows
2. explicit uninstall flows for project/global note stores
3. note move between scopes
4. explicit command help listing
5. setup bootstrap flow that creates directories and a starter global note

## Scope

- New command surface and UX behavior for setup/help/move/uninstall
- Markdown-preserving authoring/editing workflow spec
- Safety requirements for destructive operations
- Deterministic behavior and migration-safe command grammar
- Matching updates to durable docs + tests

## Out of scope

- Background sync
- Auto-generation/AI mutation without explicit user trigger
- Breaking changes to existing command semantics without migration notes

## Validation gate (required before completion)

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
