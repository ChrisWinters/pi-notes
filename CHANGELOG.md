# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added
- Symlink, wrong-type, containment, cancellation, shared-queue, headless-mode, release, and package regression coverage
- Recoverable owner-only temporary artifacts for complete truncated tool output with scheduled 24-hour and startup stale cleanup
- Explicit typed command outcomes independent of UI notification severity

### Changed
- Extension storage now honors Pi's configured directory name; standalone CLI retains `.pi` compatibility
- Extension mutations coordinate through Pi's file mutation queue; CLI/internal mutations remain process-local
- Agent move/rename tools no longer expose overwrite and return exact human-confirmed command handoffs on conflicts
- Print/JSON direct commands now emit an observable unsupported CLI handoff instead of silent success
- Pi coding-agent and TypeBox imports are host-provided peers with repository-tested development versions
- CI now uses `npm ci`; publishing now requires a published release or protected-main manual tag route with tag/version verification

### Security
- All note operations reject relevant symlinked config/storage components and entries and require canonical containment and regular path types
- Tool cancellation is checked before queued mutation starts, preventing deferred writes after abort

## [1.0.0] - 2026-05-24

### Added
- Agent-facing `notes_*` tools for setup, list, show, new, append, grep, rename, and move flows
- Tool-first `pi-notes` skill guidance for agent-side note routing
- Package-specific Pi extension entrypoint at `extensions/pi-notes/index.ts`
- Hidden compatibility aliases for add/list-style note commands

### Changed
- Pi package manifest now loads the unique `./extensions/pi-notes/index.ts` extension path
- Package contents now include the `extensions` entrypoint directory
- Default generated note headings now use `h2`
- Architecture and agent docs updated for tool-first extension behavior and local package entrypoints

### Fixed
- CLI direct-entry detection for symlinked `pi-notes` binaries
- Pi package imports aligned with current `@earendil-works/pi-coding-agent` APIs
- Agent tool failures now throw correctly and successful tool output is truncated safely
- Note mutations are serialized by path to prevent concurrent write races

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
