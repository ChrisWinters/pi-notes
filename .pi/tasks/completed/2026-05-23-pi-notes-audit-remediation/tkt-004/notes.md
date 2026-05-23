# tkt-004 Notes

Updated documentation for tool-first extension behavior:

- README now points at the current Pi repository, mentions `notes_*` tools, and documents the registered agent-facing tool set separately from slash/CLI commands.
- `docs/commands.md` now describes three surfaces: `/notes`, `notes_*` tools, and `pi-notes` CLI.
- `docs/architecture.md` now describes `pi.registerTool()`, the shared tool adapter, error signaling, output truncation, and current Pi docs link.
- Added package-resource documentation tests that assert tool-first docs are present and hidden `/notes add` / `/notes list` aliases remain undocumented.
