# Product requirements

## Problem

pi-notes currently follows symlinked note paths, uses a private mutation queue that does not coordinate with Pi, ignores tool cancellation, exposes impossible overwrite parameters, reports some failed tools as success, loses complete truncated output, silently handles direct commands in print/JSON, diverges from Pi package metadata guidance, and has documentation/release automation drift.

## Users

- Pi users managing project and global notes.
- Agents invoking `notes_*` tools.
- Headless users invoking Pi print/JSON/RPC modes or the standalone CLI.
- Maintainers installing, testing, and publishing the package.

## Required outcomes

1. Note storage fails closed on every symlinked config/storage component or note entry and never changes an external target.
2. Extension mutations join Pi's shared file mutation queue; CLI operations retain safe local serialization.
3. Cancelled tools do not begin later mutations.
4. Tool schemas expose only executable behavior; overwrite conflicts hand users to exact interactive commands.
5. Failed requested tool operations are Pi errors; legitimate empty results remain successful.
6. Complete truncated output is recoverable from an owner-only temporary artifact with bounded retention.
7. Direct `/notes` use in print/JSON has an observable result or observable unsupported handoff; RPC/TUI behavior remains correct.
8. Extension mode honors `CONFIG_DIR_NAME`; CLI keeps `.pi` default with only a validated explicit override.
9. Package peers, lockfile, CI, and publish workflow follow current Pi and repository release contracts.
10. Tests, docs, skill guidance, changelog, and generated output match shipped behavior.
11. Default-scope mutations cannot switch to an unacquired project/global path while waiting for a queue.
12. Uninstall rejects internal symlink/broken-link/wrong-type entries before removing any part of the scope.
13. Complete tool result text stays inside Pi limits, and artifact cleanup runs at deadline while live plus on later startup.
14. Broken-link, scan-abort, Pi-style queue-race, and TUI adapter boundaries have deterministic evidence.

## Explicit exclusions

- No npm publish or git push.
- No agent-authorized destructive overwrite.
- No support for intentionally symlinked notes storage.
- No cross-process CLI locking guarantee.
- No note format, naming, or scope-precedence redesign.
- No pagination-first truncation redesign.

## Success measures

- The former symlink exploit fails closed and external content remains unchanged.
- Required validation (`lint`, `typecheck`, `test`, `build`) passes.
- Offline mode/package smoke checks pass without API credentials.
- `task-validator` verifies every story and no root gaps remain.
