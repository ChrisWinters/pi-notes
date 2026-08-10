# tkt-001 notes — Secure storage roots and reject symlinks

## Objective

Implement `spec.md` sections 5 and ST-001 before queue/outcome work.

## Changes

- Added a validated `configDirName` storage option; standalone callers retain `.pi`, while extension commands/tools pass Pi's `CONFIG_DIR_NAME`.
- Resolve configured roots to absolute paths and validate config-directory names as a single safe component.
- Create and inspect config/notes directories component-by-component, requiring regular directories and canonical containment of notes below config.
- Require regular note entries and reject symbolic links/non-files before reads and mutations.
- Use `O_NOFOLLOW` handles for note reads, creates, truncating writes, setup starter creation, and move/rename destinations.
- Revalidate directory and entry boundaries inside existing mutation windows for create, write, append, delete, move, rename, setup, and uninstall.
- Added project/global symlink regressions for note reads/appends, config and notes directories, overwrite move/rename, setup, and uninstall.

## Decisions and boundaries

- Symlinks are rejected even when they resolve inside the intended root.
- Caller-owned ancestors above the config directory remain outside pi-notes' storage-component policy; config, notes, and note entries are strict boundaries.
- Portable path checks cannot eliminate every directory-swap race, but no-follow file handles close the audited note-file follow vulnerability and all checks fail closed.
- Note names, markdown format, scope precedence, and cross-process coordination are unchanged.
