# Stories: pi-notes Agent Skill + Extension Bundle

## Story source references

- Skill behavior source: `docs/plans/active/2026-04-05-pi-notes-agent-skill-bundle/pi-notes/SKILL.md`
- Extension packaging/reference source: `docs/plans/active/2026-04-05-pi-notes-agent-skill-bundle/extensions.md`

## Story 1 — Update a global note safely

As a user, when I say “update the global npm note,”
I want the agent to resolve that to `~/.pi/notes/npm.md` and confirm changes,
so the right note is updated safely.

### Acceptance criteria

- Behavior matches intent/scope/mutation rules in `pi-notes/SKILL.md`.
- Detects note intent.
- Resolves to global path.
- Reads existing content first.
- Shows concise preview.
- Requires explicit confirmation before apply.
- Reports final path and what changed.

## Story 2 — Show note without mutation

As a user, when I say “show note npm global,”
I want the agent to read and present the note content,
so I can verify current state without accidental edits.

### Acceptance criteria

- Resolves scope and note name.
- Performs read-only flow.
- Returns content/summary without mutation.

## Story 3 — Ambiguous target disambiguation

As a user, when I say “update the npm note” without scope,
I want the agent to ask one clarifying question,
so edits do not hit the wrong location.

### Acceptance criteria

- Mutation request with missing scope triggers clarification question.
- No edit happens before disambiguation.

## Story 4 — Repo-doc vs pi-note ambiguity

As a user, when wording could mean docs file or note,
I want a direct disambiguation question,
so the agent does not assume the wrong target system.

### Acceptance criteria

- Agent asks: pi-note vs repo-doc target.
- No edit applied until user confirms target.

## Story 5 — Installed package includes behavior

As a package consumer,
I want bundled resources (including this skill) available after package install,
so I do not need manual skill copy steps.

### Acceptance criteria

- Package metadata/resource layout includes skill path.
- Installation docs mention bundled skill behavior.
- Packaging assumptions and docs are aligned with `extensions.md` guidance.
