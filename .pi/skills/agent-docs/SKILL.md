---
name: agent-docs
description: Build and maintain a scan-first YAML project context file for agents, anchored to source code paths instead of plan/docs narratives.
user-invocable: true
license: MIT
metadata:
  tags: agent, agents, documentation, docs, yaml
  author: ChrisWinters
  version: "1.0.0"
---

# Agent Docs

## Purpose

Create and maintain a single YAML context file that helps agents learn a project quickly by reading:
1) this YAML file
2) referenced code paths

Do not use this file as a timeline or changelog.

## Use when

- User asks to document how a project works for agents.
- Existing markdown docs are drifting/outdated/noisy.
- Team needs durable context that is fast to scan and token-efficient.

## Primary output

Create or update:
- `<repo>/docs/agent-docs.yaml`

If the repo has a preferred location, follow it.

## Required style rules

- YAML only.
- Category-heavy, shallow structure.
- Minimal words; no long paragraphs.
- No date fields.
- Prefer bullets/lists and short statements.
- Reference code paths directly; avoid plan/doc references as primary context.
- Explain by pointers + concise intent, not prose.

## Content model (required categories)

Use this top-level structure (add only what is needed):

- `project`
- `entrypoints`
- `architecture`
- `runtime_flows`
- `contracts`
- `state`
- `integrations`
- `validation`
- `operations`
- `constraints`
- `glossary`
- `open_questions`

Rules:
- Keep nesting shallow (target depth <= 3).
- Every non-trivial claim should have one or more `refs` code paths.
- `open_questions` should be short and actionable.

## Source selection policy

Read code first. Use docs only as secondary hints.

Priority:
1. runtime entrypoints and exported APIs
2. contracts/schemas/types
3. core modules and adapters
4. tests that prove behavior
5. docs only for unresolved intent

Avoid copying implementation details that can drift quickly.

## Update policy

When updating existing YAML:
- preserve stable category order
- edit/replace stale entries instead of appending noise
- remove duplicates and speculative statements
- keep refs current and code-first

## Missing context policy (required)

If key context is missing or ambiguous, stop and ask targeted questions before finalizing.

Ask only high-impact questions, e.g.:
- source-of-truth entrypoint?
- required runtime modes?
- non-negotiable quality gates?
- hard boundaries (what must never change)?

## Example template

Use this example as baseline and adapt to the repo:
- `./example-agent-docs.yaml`

## Acceptance checklist

- [ ] YAML parses
- [ ] Category-heavy + shallow structure
- [ ] No date fields
- [ ] Minimal prose
- [ ] Core behavior mapped to code refs
- [ ] No dependency on plan/doc files for core understanding
- [ ] Open questions captured when uncertainty remains
