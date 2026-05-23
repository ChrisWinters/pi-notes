# PRD: note template and hidden shortcuts

## Problem

New notes currently start with an h1 body heading, which is too prominent for note content under frontmatter. Users also want ergonomic shortcut commands for common create/list flows without expanding the public command surface.

## Users

- Pi users creating and browsing notes with `/notes`.
- Agents/tools that route through the same notes command handlers.
- Maintainers preserving public docs/help clarity.

## Goals

- Make generated note bodies start with an `##` heading and blank-line spacing.
- Provide `/notes add` as a hidden shortcut for `/notes new`.
- Provide `/notes list` as a hidden shortcut for `/notes ls`.
- Keep hidden aliases out of public help and README command lists.

## Functional requirements

1. New notes created via the canonical create path use `## <title>` as first body heading.
2. Setup starter note content uses `## Welcome to notes` and matching spacing.
3. `/notes add <name> [--project|--global]` behaves like `/notes new <name> [--project|--global]`.
4. `/notes list [--project|--global]` behaves like `/notes ls [--project|--global]`.
5. `/notes` help output does not list `add` or `list`.
6. README command lists do not list `add` or `list`.

## Non-functional requirements

1. Existing parser/storage safety behavior remains unchanged.
2. TypeScript, lint, tests, and build pass.
3. Changes remain small and focused.

## Success metrics

- Command tests prove both aliases work.
- Format tests prove heading/spacing behavior.
- Non-exposure tests guard README/help behavior.
