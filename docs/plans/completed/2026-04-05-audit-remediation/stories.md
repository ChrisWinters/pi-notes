# Stories: Audit Remediation

## Story 1 — Fix command parsing bug

**Outcome:** Scope flag parsing is deterministic and does not corrupt user content.

### Includes
- explicit option parsing rules
- support for preserving literal `--project`/`--global` tokens in content
- optional `--` separator support

### Done when
- prior audit repro no longer fails
- tests cover append/grep/rewrite content with flag-like tokens

---

## Story 2 — Add race safety to storage writes

**Outcome:** create and mutation paths are safe under concurrent calls.

### Includes
- atomic create semantics
- per-note write serialization for append/write operations

### Done when
- create race no longer check-then-write vulnerable
- append lost-update scenario is mitigated by serialization

---

## Story 3 — Expand reliability test coverage

**Outcome:** bug/race regressions are prevented by dedicated tests.

### Includes
- regression tests for parser semantics
- concurrency-oriented tests for create/append behavior

### Done when
- tests fail on old behavior and pass on fixed behavior

---

## Story 4 — Refactor command layer for maintainability

**Outcome:** command logic is decomposed into smaller modules while preserving behavior.

### Includes
- parser extraction
- per-subcommand handlers
- shared command context/utilities

### Done when
- `notes.ts` router complexity is reduced
- behavior remains consistent and tests remain green

---

## Story 5 — Documentation and release readiness refresh

**Outcome:** public docs reflect parser/race-safety changes.

### Includes
- command docs updated for option parsing semantics
- security/storage docs updated with race-safety behavior
- release checklist updated with new regression checks

### Done when
- docs match implementation
- quality gate passes with updated tests
