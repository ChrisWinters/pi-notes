# PRD: pi-notes agent tools

## Problem

Agents currently rely on CLI commands or manual file access for pi-notes operations. The global CLI shim has had install/runtime drift in at least one environment, and shelling out is slower and less structured than Pi custom tools.

## Users

- Pi users asking an agent to manage project or global notes.
- Agents operating inside Pi with the `pi-notes` extension installed.
- Maintainers validating extension behavior.

## Goals

- Provide a safe tool-first path for common note operations.
- Keep existing slash command and CLI behavior intact.
- Preserve note storage safety guarantees.
- Teach the bundled skill how to route prompts to the new tools.

## Requirements

### Functional requirements

1. The extension registers tools for setup, list, show, new, append, grep, rename, and move.
2. Tools support project/global/default scope where applicable.
3. Tools return captured command output plus structured details.
4. Tools reuse existing command handlers and storage logic.
5. The skill maps common note prompts to the correct tool.
6. Delete and uninstall remain explicit user-handoff flows, not agent tools.

### Non-functional requirements

1. TypeScript remains strict and lint-clean.
2. Tool schemas are provider-compatible.
3. Tests cover registration and representative execution.
4. The implementation avoids global environment mutation and release behavior.

## Success metrics

- Agents can satisfy “show/list/create/append/search/rename/move note” prompts through tools.
- Existing tests plus new tests pass.
- The skill no longer recommends CLI as the primary path when tools are available.
