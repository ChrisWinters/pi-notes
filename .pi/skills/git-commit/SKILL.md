---
name: git-commit
description: Enforce repository-specific commit subject style from local git history.
user-invocable: true
license: MIT
metadata:
  tags: git, commit, repo
  author: ChrisWinters
  version: "1.0.0"
---

# Commit Style Enforcer

## Purpose
Create commit messages that match the dominant style in the current repository.

## Use when
- Writing a new commit message.
- Reviewing or rewriting a commit subject before `git commit`.
- Enforcing consistency across multiple commits.

## Inputs to read
- `git log --pretty=format:'%h %s' -n 80`
- `git diff --cached --name-only`
- `git diff --cached --stat`
- Any user-provided ticket/plan IDs (for example `DSH-008`, `NARR-006`).

## Execution steps
1. Infer commit `type` from staged change intent:
   - `feat`: behavior/capability additions.
   - `fix`: bug/contract corrections.
   - `docs`: plan, audit, reconciliation, notes.
   - `test`: test-only coverage/backfills.
   - `chore`: tooling/maintenance.
   - `ops`: deployment/runtime gates.
2. Infer `scope` from affected paths/domain (common scopes: `next`, `smoke`, `audit`, `agent`, `plan`, `plans`).
3. Draft subject in this shape:
   - `<type>(<scope>): <imperative summary>`
   - or `<type>: <imperative summary>` when no clear scope exists.
4. Prefer imperative verbs found in local history (common examples: `add`, `fix`, `harden`, `align`, `archive`, `record`, `reconcile`, `clarify`, `implement`, `complete`, `land`).
5. If a ticket ID exists, include it early in summary (example: `docs(plan): record ABC-007 approval and unblock ABC-008`).
6. Keep subject concise and specific to the staged diff.

## Validation
- Subject matches regex: `^[a-z]+(\([a-z0-9-]+\))?: [a-z0-9]`
- No trailing period.
- Prefer <= 72 chars; allow longer only when ticket/context clarity requires it.
- Avoid vague summaries (`update stuff`, `misc fixes`, `first commit`).
- Message should describe outcome, not implementation minutiae.

## Guardrails
- Do not invent ticket IDs.
- Do not claim completion unless staged diff proves it.
- If diff spans unrelated concerns, ask to split into multiple commits.
- Preserve user intent; suggest improvements but do not silently alter requested semantics.
