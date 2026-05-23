# pi-notes audit remediation

Lifecycle task to remediate findings from `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/`.

## Execution order

1. Align Pi package imports/dependencies and add package-load smoke coverage.
2. Correct custom tool error semantics and output truncation.
3. Make note mutation queueing consistent for same-note operations.
4. Update README/docs to reflect tool-first agent behavior.

See `spec.md`, `prd.md`, `stories.md`, and `tickets.md` for execution details.
