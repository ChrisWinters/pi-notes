# tkt-001 notes — Correct adapter boundary zones

Status: complete

## Scope

Implemented the boundary configuration and documentation slice defined in `spec.md` and `tickets.md`.

## Decisions and tradeoffs

- Split the former `entry` boundary into `package-shim`, `pi-extension-adapter`, and `cli-adapter`; Fallow's resolved listing confirms each exact path is assigned to one intended zone.
- Kept all three files as runtime entry points. Boundary zones describe dependency policy independently from entry-point discovery.
- Allowed the Pi adapter to use commands and core because host queue and bounded-output integration intentionally live there.
- Kept the CLI adapter restricted to commands; it receives no broad core access.
- Documented the policy in current architecture and scan-first agent context without adding source suppressions.

## Follow-up notes

None.
