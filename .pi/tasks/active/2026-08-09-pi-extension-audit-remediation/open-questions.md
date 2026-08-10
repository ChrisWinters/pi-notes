# Open questions

## 1. Filesystem symlink policy

Should pi-notes reject any symlinked `.pi`/config directory component, notes directory, or note file, even when the symlink resolves inside the intended root?

**Recommended answer:** Yes. Reject symlinked storage components and note entries. A strict regular-directory/regular-file contract is easier to secure, test, and explain than selectively permitting contained symlinks.

## 2. Agent overwrite contract

Should `overwrite` be removed from `notes_move` and `notes_rename`, with destination conflicts handed back to the user as exact interactive `/notes ... --overwrite` commands?

**Recommended answer:** Yes. Preserve the non-destructive agent tool boundary and make overwrite an explicit human-interactive command flow.

## 3. Print and JSON `/notes` behavior

Should direct `/notes` commands become observably supported in print/JSON modes, or should those modes receive an explicit observable unsupported response directing users to the standalone CLI?

**Recommended answer:** Prefer a mode-safe observable command result if Pi APIs can provide it without duplicate TUI/RPC output or model-context pollution; otherwise emit an explicit unsupported result and document the CLI as the headless interface. Prototype the Pi API boundary before locking the implementation approach.

## 4. Standalone CLI config-directory behavior

Should `pi-notes` CLI remain fixed to `.pi` by default while extension execution uses Pi's `CONFIG_DIR_NAME`, and should the CLI gain an explicit override for rebranded hosts?

**Recommended answer:** Preserve `.pi` as the CLI default for backward compatibility, inject `CONFIG_DIR_NAME` in extension mode, and add a narrowly validated explicit override only if it can be documented without ambiguous data migration.

## 5. Truncated-output artifact retention

How long should secure temporary files containing full truncated note output remain available?

**Recommended answer:** Use owner-only OS temporary files with a documented bounded retention/cleanup strategy that keeps the artifact available for a follow-up read in the current session. Do not retain indefinitely or place it inside project storage.

## 6. Publish trigger model

Should npm publishing use the currently documented `release.published` plus `workflow_dispatch` triggers instead of pushes to a `release` branch, and should a protected GitHub environment be required?

**Recommended answer:** Use `release.published` and protected `workflow_dispatch`, verify tag/version agreement, and use a protected environment when repository settings support it.
