# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-04-06

### Added
- New standalone CLI entrypoint: `pi-notes <subcommand> ...`
- Shared CLI command routing that mirrors `/notes` command behavior
- Bundled `pi-notes` skill for note-intent detection, scope resolution, and command routing guidance
- Skill/docs references for extension and agent-skill bundling

### Changed
- README and command docs updated with CLI usage and skill workflows
- Test coverage updated for CLI and bundled skill behavior

## [0.1.1] - 2026-04-05

### Added
- New commands: `setup`, `help`, `commands`, `edit`, `move`, `uninstall`
- Idempotent setup flow for `.pi/notes` and `~/.pi/notes` with starter global `note.md`
- Markdown-preserving editor workflow via `/notes edit`
- Scope move flow with explicit targets (`--to-global`, `--to-project`) and optional `--overwrite`
- Confirm-gated uninstall flow with project/global targeting
- Package manifest for Pi package loading (`pi.extensions`)
- GitHub Actions publish workflow with npm provenance (`npm publish --provenance`)

### Changed
- npm package moved to scoped name: `@tribalnerd/pi-notes`
- README install instructions updated for scoped package name

## [0.1.0] - 2026-04-05

### Added
- Initial project scaffold with strict TypeScript, strict ESLint, tests, and CI gate
- Safe note-name normalization and path-safety validation
- Scope-aware storage for project/global notes with project-precedence resolution
- Deterministic command set: `ls`, `show`, `new`, `append`, `rm`, `grep`
- Confirm-gated rewrite workflow with preview and explicit apply step
- Public docs for architecture, commands, storage, security, and release operations

### Notes
- `rewrite` uses editor-driven proposal flow; instruction text is preserved as user intent metadata in command output.
