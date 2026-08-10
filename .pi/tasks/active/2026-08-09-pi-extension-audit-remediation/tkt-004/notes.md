# tkt-004 notes — Recover truncated output and fix mode observability

## Objective

Implement `spec.md` section 8 and ST-004.

## Scope

- Prototype current Pi mode-safe command output.
- Implement observable print/JSON result or approved observable unsupported fallback.
- Prevent duplicate TUI/RPC output and model-context pollution.
- Store complete truncated output in owner-only OS temp artifacts with bounded retention.
- Return structured metadata, document limits, and add offline mode/artifact tests.

## Boundaries

- No pagination redesign.
- Artifacts must remain outside project/global notes and must not persist indefinitely.

## Execution notes

Pending execution.
