# tkt-004 notes — Reconcile Fallow and final project evidence

Status: complete

## Scope

Completed Fallow, repository, package, documentation, and lifecycle reconciliation after all implementation tickets.

## Decisions and tradeoffs

- Re-ran every original finding category and all clean regression categories with measured coverage.
- Original boundary findings are resolved by narrow adapter zones; original clone fingerprints are absent; original static CRAP candidates clear the measured threshold with no production adapter refactor.
- Retained Fallow trace `error: true` responses as expected evidence that resolved fingerprints no longer exist, not runtime failures.
- Documented the local coverage command in README and scan-first agent validation context.
- Security output remains candidate evidence only. It found zero configured candidates and zero attack-surface entries; unresolved dynamic-call diagnostics are tool analysis limitations, not candidate findings.
- No package, generated-artifact, CI, release, hook, telemetry, publishing, or external-service scope was added.

## Follow-up notes

None.
