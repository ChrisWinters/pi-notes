# Tickets

Execute in order. A ticket is complete only when its notes/evidence are current, focused validation passes, and its commit is recorded.

- [x] **tkt-001 — Secure storage roots and reject symlinks**
  - Scope: `src/core/storage.ts`, related naming/errors/config plumbing, storage/command tests.
  - Delivers: ST-001; validated root/config inputs; fail-closed regular path handling for all read/mutation/lifecycle operations.
  - Depends on: none.

- [x] **tkt-002 — Coordinate mutations and honor cancellation**
  - Scope: storage coordinator abstraction, extension adapter, command context, concurrency/cancellation tests.
  - Delivers: ST-002; Pi shared queue integration, deterministic multi-key ordering, local CLI queue, abort propagation.
  - Depends on: tkt-001 safe path identity.

- [x] **tkt-003 — Add typed outcomes and truthful tool contracts**
  - Scope: command result model, handlers/adapters, CLI, tools, bundled skill, focused tests.
  - Delivers: ST-003; error signaling independent of notification level; no agent overwrite; exact conflict handoffs.
  - Depends on: tkt-001 and tkt-002 operation contexts.

- [x] **tkt-004 — Recover truncated output and fix mode observability**
  - Scope: tool output adapter/temp artifacts, Pi mode prototype/adapter, RPC/JSON/print/tool tests.
  - Delivers: ST-004; complete output recovery and no silent headless commands.
  - Depends on: tkt-003 typed outcomes.

- [x] **tkt-005 — Align package, CI, and release contracts**
  - Scope: `package.json`, lockfile, package tests, CI/publish workflows, release preflight tests.
  - Delivers: ST-005.
  - Depends on: stable imports from preceding tickets; may start after tkt-003 if needed.

- [x] **tkt-006 — Reconcile docs and complete validation**
  - Scope: README, docs, skill final pass, changelog, generated `dist/`, complete tests and smoke checks.
  - Delivers: ST-006 and final cross-ticket reconciliation.
  - Depends on: tkt-001 through tkt-005.

- [x] **tkt-007 — Stabilize queued identities and strict uninstall scanning**
  - Scope: `src/core/storage.ts`, mutation hooks/coordinator tests, storage security tests.
  - Delivers: ST-007 and repairs GAP-002/GAP-003.
  - Depends on: tkt-001/tkt-002 foundations.

- [x] **tkt-008 — Bound complete output and actively expire artifacts**
  - Scope: `src/index.ts`, `src/core/output-artifact.ts`, output/artifact tests and accurate docs.
  - Delivers: ST-008 and repairs GAP-001.
  - Depends on: tkt-004 output adapter.

- [x] **tkt-009 — Complete boundary proof and repair reconciliation**
  - Scope: broken-link, scan-abort, Pi-style queue, TUI adapter tests; docs/evidence/final gates.
  - Delivers: ST-009 and repairs GAP-004 plus cross-gap final evidence.
  - Depends on: tkt-007 and tkt-008.
