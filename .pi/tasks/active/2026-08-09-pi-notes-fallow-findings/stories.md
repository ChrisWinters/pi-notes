# Stories: pi-notes Fallow findings remediation

## Story 1 — Maintainer trusts architecture boundaries

As a maintainer, I want Fallow zones to represent distinct package, Pi adapter, CLI adapter, command, core, and UI responsibilities so error-level boundary output identifies real drift rather than documented integration.

Acceptance criteria:

- The package shim and two runtime adapters are modeled separately.
- Allowed directions match source and architecture docs.
- Boundary and coverage scans report no unexplained findings.
- No inline suppression hides the current imports.

## Story 2 — Reviewer sees consistent interactive preflight

As a reviewer of destructive/editor commands, I want rewrite and remove to share one typed lookup/UI gate so missing-note and headless behavior cannot drift while operation-specific control flow stays visible.

Acceptance criteria:

- One command-layer helper owns note lookup, missing-note warning, and UI requirement, or a concrete trace-backed experiment documents why retaining the small flow is more auditable.
- Rewrite still owns editor, preview, apply confirmation, and cancellation.
- Remove still owns destructive confirmation, deletion, and cancellation.
- Existing visible messages and outcome statuses remain stable.

## Story 3 — Notes user retains exclusive-write safety

As a notes user, I want create, move, and rename non-overwrite creation to share one reviewed primitive so exclusive/no-follow guarantees and cleanup cannot drift.

Acceptance criteria:

- The primitive preserves `O_EXCL`, `O_NOFOLLOW`, `0600`, full writes, and handle closure.
- Create and destination conflicts preserve their exact distinct messages.
- Unexpected failures propagate and source deletion occurs only after destination success.
- Existing race, symlink, overwrite, and source-preservation tests pass.

## Story 4 — Maintainer uses measured complexity evidence

As a maintainer, I want repeatable measured coverage before refactoring moderate complexity candidates so changes target real untested branches rather than static estimates.

Acceptance criteria:

- A Vitest-compatible V8 provider and `test:coverage` script produce ignored JSON coverage.
- Measured branch evidence is recorded for `parseCliFlags` and `handleParsedNotesCommand`.
- Exact uncovered behavior receives targeted tests first.
- Refactoring occurs only if measured CRAP remains above the configured threshold.

## Story 5 — Reviewer can verify complete reconciliation

As a reviewer, I want every original audit finding and clean category mapped to final evidence so completion has no hidden suppressions, generated artifacts, or scope growth.

Acceptance criteria:

- Ticket notes/evidence explain implementation choices and residuals.
- Full Fallow, package, and repository validation passes.
- Current-state maintenance docs match configuration and scripts.
- No publishing, hooks, telemetry, CI gate, or external write is introduced.
