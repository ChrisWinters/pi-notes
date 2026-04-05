# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - Unreleased

### Added
- Initial project scaffold with strict TypeScript, strict ESLint, tests, and CI gate
- Active planning docs and ticket-based execution discipline
- Safe note-name normalization and path-safety validation
- Scope-aware storage for project/global notes with project-precedence resolution
- Deterministic command set: `ls`, `show`, `new`, `append`, `rm`, `grep`
- Confirm-gated rewrite workflow with preview and explicit apply step
- Public docs for architecture, commands, storage, security, and release operations

### Notes
- `rewrite` currently uses editor-driven proposal flow; instruction text is preserved as user intent metadata in command output.
