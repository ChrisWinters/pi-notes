# AGENTS.md — pi-notes project rules

## Purpose

This repo builds a public Pi extension package (`pi-notes`) with strict engineering and documentation discipline.

## Rules

1. Follow active plan tickets in `docs/plans/active/`.
2. Keep behavior deterministic by default.
3. AI mutation must be explicit, reviewable, and confirm-gated.
4. Enforce strict TypeScript and strict ESLint; do not introduce lint debt.
5. Update docs and plan state in the same slice when contracts change.
6. Do not make breaking command grammar changes without migration notes.
7. Do not push commits unless explicitly requested.

## Safety

- Reject unsafe path inputs.
- Confirm destructive actions.
- Preserve clear user-facing error messages.

## Validation

Run and pass before marking a slice complete:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
