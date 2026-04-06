# PRD: pi-notes Agent Skill + Extension Bundle

## Problem

Users naturally say things like “update the global npm note,” and agents may incorrectly interpret this as repo documentation work instead of note storage work.

The package needs explicit, deterministic routing guidance to reduce ambiguity and prevent wrong-target edits.

## Goals

1. Detect note-centric intent reliably.
2. Resolve target scope deterministically (`--global` vs `--project`).
3. Enforce safe mutation flow (read → preview → confirm → apply).
4. Ask one concise fallback question when intent/scope/target is ambiguous.
5. Ship this behavior with the package so install flows can include it.

## Non-goals

- Introducing fuzzy, non-deterministic mutation behavior.
- Silent destructive actions.
- Breaking existing `/notes` command grammar.

## Users

- Pi users installing `pi-notes` package.
- Agent operators relying on consistent note-target routing.

## Functional requirements

### FR1 — Intent detection contract

The skill must recognize note intent from phrases such as:

- update/edit/append/rewrite note
- show/open/read note
- global note / project note
- explicit note path like `~/.pi/notes/<name>.md`

### FR2 — Scope/path resolution contract

- `--global` or “global note” resolves to `~/.pi/notes/<name>.md`.
- `--project` or “project note” resolves to project-local notes root.
- If both scopes are present, ask user to choose one.
- If scope is omitted for mutation requests, ask a clarification question first.

### FR3 — Safe mutation contract

For content-changing operations, workflow must be:

1. resolve target
2. read current note
3. prepare minimal patch
4. show concise preview summary
5. request confirmation
6. apply
7. report path + result

### FR4 — Ambiguity handling

If the request could target either repo docs or pi-notes, ask a direct disambiguation question before editing.

### FR5 — Packaging

Skill resources must be discoverable when package is installed through normal Pi package install flow.

## UX requirements

- Keep prompts concise.
- Echo resolved scope and path before mutation.
- Preserve clear user-facing error messages for invalid paths/unsafe inputs.

## Success criteria

- Note-intent misroutes reduced in manual smoke scenarios.
- Global vs project note updates are explicitly resolved before edits.
- No silent destructive note mutations.

## Risks

- Over-triggering on generic “note” language.
- Inconsistent project note path assumptions.

## Mitigations

- Keep trigger patterns specific and scoped.
- Document exact scope mapping and fallback question behavior.
- Add tests and examples for ambiguous prompts.
