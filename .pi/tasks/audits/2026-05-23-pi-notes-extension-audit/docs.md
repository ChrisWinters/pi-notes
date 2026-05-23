# Documentation findings

## Finding: project docs still describe command-first skill behavior and old upstream docs

### Affected paths

- `README.md`
- `docs/architecture.md`
- `docs/commands.md`
- `skills/pi-notes/SKILL.md`
- `src/index.ts`

### Observed behavior

The current skill has been updated to tool-first behavior:

- `skills/pi-notes/SKILL.md`: “When available, use registered `notes_*` tools...”

`src/index.ts` now registers eight custom tools (`notes_setup`, `notes_list`, `notes_show`, `notes_new`, `notes_append`, `notes_grep`, `notes_rename`, `notes_move`).

However, project docs still describe older command-first behavior:

- `README.md`: “Uses command-first responses and safe handoff for restricted operations”
- `docs/commands.md`: “bundles a skill ... to guide intent routing and command-first responses”
- `docs/architecture.md`: module list says `src/index.ts` registers only `/notes` command and describes command-first design, without mentioning custom tools.
- `docs/architecture.md` links upstream docs at `https://github.com/badlogic/pi-mono/...`, while current local Pi docs used for this audit live under `@earendil-works/pi-coding-agent` and examples import `@earendil-works/*` packages.

### Expected Pi/documented behavior

Current Pi package docs (`docs/packages.md`) treat packaged skills and extensions as package resources. Current extension docs (`docs/extensions.md`) list custom tools as a key extension capability and document `promptSnippet`/`promptGuidelines` behavior.

Project docs should accurately describe shipped package resources and the current extension contract users/agents rely on.

### Impact

Users and maintainers reading README/docs will miss the new agent tool surface and may continue to use slower or less structured CLI/shell flows. The old upstream link/package naming also makes it harder to audit against the current Pi docs and can reinforce stale import choices.

### Recommended remediation

- Update `README.md` bundled skill section to say the skill prefers `notes_*` tools when available and falls back to `/notes`/CLI.
- Update `docs/commands.md` to mention the custom tool surface separately from slash/CLI commands.
- Update `docs/architecture.md` module/data-flow sections to include `pi.registerTool()` registrations and tool adapter behavior.
- Replace old `badlogic/pi-mono` docs links with current `earendil-works/pi-mono`/local-doc references where appropriate.
