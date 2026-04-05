# Stories: pi-notes MVP

## Story 1 — Project bootstrap and quality baseline

**Outcome:** Repository is publishable-grade with strict TypeScript/ESLint, base docs, and CI foundations.

### Includes
- package metadata and scripts
- strict tsconfig setup
- strict eslint setup
- base README, AGENTS, docs skeleton
- baseline CI workflow

### Done when
- `lint`, `typecheck`, `test`, `build` scripts exist and run
- strict settings enabled
- docs skeleton committed

---

## Story 2 — Storage and naming core

**Outcome:** Safe, deterministic note storage layer with scope resolution and markdown/frontmatter support.

### Includes
- scope resolver (project/global/default precedence)
- note name slugging + validation
- path safety guardrails
- note read/write/create/delete primitives
- frontmatter parse/write helpers

### Done when
- traversal attempts are blocked
- project/global behavior is deterministic
- unit tests cover naming and storage edge cases

---

## Story 3 — Deterministic command surface

**Outcome:** `/notes` v1 commands for non-AI workflows are fully functional.

### Includes
- `ls`, `show`, `new`, `append`, `rm`, `grep`
- scope flags support
- clear output formatting with scope visibility
- confirm gate for `rm`

### Done when
- command behavior matches PRD
- docs updated with command examples
- tests cover normal + failure paths

---

## Story 4 — AI rewrite flow with preview/confirm

**Outcome:** AI-assisted rewrite is explicit, reviewable, and safe.

### Includes
- `rewrite` command contract
- proposed content/diff preview
- explicit user approval before write
- no-op/abort behavior when user declines

### Done when
- rewrite never mutates without approval
- rewrite error cases are handled clearly
- tests cover approve/decline/missing-note paths

---

## Story 5 — Release hardening and publish prep

**Outcome:** `pi-notes` is ready for public release.

### Includes
- docs completion and consistency pass
- final CI checks green
- changelog/release notes prep
- npm publish checklist and dry run

### Done when
- manual smoke test complete
- release docs/checklist complete
- package metadata validated for npm
