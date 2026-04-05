# PRD: Audit Remediation

## 1. Problem

The audit identified a confirmed command parsing bug and medium-priority race risks that can lead to incorrect behavior and lost updates under concurrency. Maintainability concerns also indicate growing implementation friction.

## 2. Goals

- Eliminate scope-flag parsing ambiguity and content-token stripping bug.
- Add atomic and serialized write semantics to reduce race risk.
- Add focused regression tests to lock in fixes.
- Improve command-layer maintainability without changing user-facing command grammar.

## 3. Non-goals

- Expand command feature set beyond audited items.
- Introduce external synchronization or distributed state.
- Rework storage format.

## 4. Users impacted

- Primary: command users invoking `/notes` in normal workflows.
- Secondary: maintainers extending command behavior safely.

## 5. Functional requirements

### FR-1: Flag parsing correctness

- Scope flags are parsed only in defined positions.
- Literal flag-like tokens in append/query/instruction content remain content.
- Optional support for `--` end-of-options semantics.

### FR-2: Atomic note creation

- `createNote` must not rely on check-then-write race-prone flow.
- Concurrent create attempts for same note must result in a single creator and clear error for others.

### FR-3: Serialized note mutation

- Append/write flows must serialize per note path to prevent lost updates.

### FR-4: Regression tests

- Add tests for literal token bug (`--project`/`--global` in content).
- Add concurrency-oriented tests for create and append semantics.

### FR-5: Maintainability refactor

- Split command routing/parsing/handlers into dedicated modules.
- Keep behavior identical unless intentionally changed by remediation requirements.

## 6. Non-functional requirements

- Preserve strict lint/type/test/build gates.
- Keep error messaging user-readable and actionable.
- Maintain clear module boundaries.

## 7. Acceptance criteria

1. Repro from audit bug no longer reproduces.
2. Concurrency tests demonstrate atomic create and serialized append behavior.
3. Command code is modularized with reduced single-file complexity.
4. Docs and tests are updated with new parser semantics.
5. Quality gate passes.
