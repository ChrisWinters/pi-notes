# pi-notes Extension Outline (Temporary Planning Doc)

> Goal: Build a publishable Pi extension package for a human-focused notes system, developed in this repo first, then shipped to GitHub and npm.

---

## 1) Product Direction

### Core concept
A Pi extension that provides a structured notes system for the human, stored in either:

- **Project scope**: `<project>/.pi/notes/`
- **Global scope**: `~/.pi/notes/`

### Command philosophy
Use explicit subcommands to avoid ambiguity and scale cleanly.

### Recommended command set (v1)

- `/notes show <name>` — display note
- `/notes new <name>` — create empty note
- `/notes append <name> <text>` — deterministic append
- `/notes rewrite <name> <instruction>` — AI-assisted rewrite/update (with preview)
- `/notes rm <name>` — delete note (confirm before delete)
- `/notes ls` — list notes
- `/notes grep <query>` — search notes

Optional alias:
- `/notes <name>` -> same as `show`

### Scope resolution rules

Default behavior:
1. Check project scope first (`.pi/notes`)
2. Fallback to global (`~/.pi/notes`)

Flags:
- `--project` = use only project scope
- `--global` = use only global scope

### Note format
Use markdown with lightweight frontmatter.

```md
---
title: API ideas
tags: [architecture, pi]
updated: 2026-04-05T12:34:56Z
---
# API ideas

...content...
```

Why:
- Human editable
- LLM friendly
- future-safe for metadata/search

---

## 2) Architecture & Behavior

### Deterministic-first rule
Prefer deterministic operations first (`new`, `show`, `append`, `ls`, `rm`, `grep`).

AI mutation only through explicit commands:
- `rewrite` should generate a proposal and show a preview/diff before apply.

### File naming rules

- Normalize note names into safe slugs (e.g. `Project Ideas` -> `project-ideas.md`)
- Reject path traversal (`../`, absolute paths)
- Enforce `.md` extension internally

### Safety rules

- Confirm before destructive actions (`rm`)
- Show which scope file is being edited/read (`[project]` or `[global]`)
- Never silently overwrite without intent

### Future upgrades (post-v1)

- `recent` command
- backlinks (`[[note-name]]`)
- tags index
- weekly digest command
- context-aware note suggestions during chat

---

## 3) Repository Structure (Publish-Ready)

```text
pi-notes/
  src/
    index.ts                 # extension entrypoint
    commands/
      notes.ts               # command parser + handlers
    core/
      storage.ts             # scope resolution + file ops
      naming.ts              # slug/sanitization
      format.ts              # frontmatter helpers
      errors.ts              # typed errors
    ui/
      render.ts              # display formatting for notes/list/search
    types/
      notes.ts               # shared type defs

  docs/
    architecture.md
    commands.md
    storage.md
    security.md
    release.md
    changelog-policy.md

  tests/
    naming.test.ts
    storage.test.ts
    format.test.ts
    commands.test.ts

  .github/
    workflows/
      ci.yml                 # lint + typecheck + test + build
      release.yml            # optional npm publish workflow

  .npmignore                # optional (or use package.json "files")
  .gitignore
  .eslintrc.cjs             # or eslint.config.mjs (flat config)
  .prettierrc               # optional, if used
  AGENTS.md                 # project-specific agent guidance
  README.md
  LICENSE
  CHANGELOG.md
  package.json
  tsconfig.json
  tsconfig.build.json       # optional, if needed
  outline.md                # this temporary planning doc
```

---

## 4) Required Files (Minimum)

## `package.json`
Include:

- `name`, `version`, `description`, `license`, `repository`
- `type: "module"`
- strict scripts:
  - `lint`
  - `lint:fix`
  - `typecheck`
  - `test`
  - `build`
  - `prepublishOnly` (run lint + typecheck + test + build)

Likely dependencies/devDependencies:

- Runtime:
  - `@mariozechner/pi-coding-agent`
  - `@sinclair/typebox`
  - optional frontmatter parser (`gray-matter`) if desired

- Dev:
  - `typescript`
  - `eslint`
  - `@typescript-eslint/parser`
  - `@typescript-eslint/eslint-plugin`
  - `eslint-plugin-import`
  - `eslint-import-resolver-typescript`
  - `vitest` (or jest)
  - `tsx` (optional for local execution)
  - `prettier` (optional)

## `README.md`
Must include:

1. What pi-notes is
2. Installation methods
   - local path
   - npm package
   - git package
3. Command reference
4. Scope behavior (`project/global`)
5. Safety behavior (`rm` confirm, rewrite preview)
6. Development guide
7. Release guide

## `AGENTS.md`
Project-specific guidance for coding agents. Include:

- coding standards
- strict no-shortcuts policy
- testing requirements before merges
- security constraints
- no breaking CLI syntax without changelog + migration notes

## `docs/`
Create docs early for maintainability and contributor onboarding.

Recommended initial docs:

- `docs/architecture.md` — module boundaries + flow
- `docs/commands.md` — syntax and examples
- `docs/storage.md` — scope, file format, naming constraints
- `docs/security.md` — deletion guardrails and path safety
- `docs/release.md` — GitHub + npm release process

---

## 5) Strict TypeScript Configuration

Use the strictest realistic settings from day one.

Suggested `tsconfig` posture:

- `strict: true`
- `noImplicitAny: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitOverride: true`
- `useUnknownInCatchVariables: true`
- `noFallthroughCasesInSwitch: true`
- `noEmitOnError: true`
- `forceConsistentCasingInFileNames: true`
- `verbatimModuleSyntax: true`

Treat TypeScript warnings as blockers in CI.

---

## 6) Strict ESLint Policy

Enable type-aware linting and fail CI on warnings.

### Recommended rulesets

- `eslint:recommended`
- `plugin:@typescript-eslint/recommended`
- `plugin:@typescript-eslint/recommended-requiring-type-checking`
- `plugin:import/recommended`
- `plugin:import/typescript`

### Recommended high-signal rules

- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-unsafe-assignment`: error
- `@typescript-eslint/no-unsafe-member-access`: error
- `@typescript-eslint/no-floating-promises`: error
- `@typescript-eslint/consistent-type-imports`: error
- `@typescript-eslint/switch-exhaustiveness-check`: error
- `import/no-default-export`: off (keep default export for extension entry)
- `no-console`: warn/error based on preference

CI recommendation:
- `eslint . --max-warnings=0`

---

## 7) Suggested Build/Test Tooling

- **Build**: `tsc -p tsconfig.build.json` (or tsup if bundling needed)
- **Tests**: `vitest`
- **Coverage**: optional but useful before 1.0
- **CI pipeline**:
  1. install
  2. lint
  3. typecheck
  4. test
  5. build

---

## 8) Implementation Plan (Milestones)

### Milestone 1: Scaffold
- Create package skeleton
- Add strict TS/ESLint
- Add docs folder + README stubs

### Milestone 2: Storage core
- Scope resolver
- Safe path builder
- slug/naming logic
- markdown/frontmatter parser/writer

### Milestone 3: Command surface (v1)
- `/notes ls`
- `/notes show`
- `/notes new`
- `/notes append`
- `/notes rm` (confirm)
- `/notes grep`

### Milestone 4: AI-assisted command
- `/notes rewrite` proposal + preview + confirm apply

### Milestone 5: Release hardening
- tests + edge cases
- README command examples
- CI green
- publish checklist

---

## 9) Edge Cases to Design Now

- note names with spaces/punctuation
- duplicate names in project/global scope
- empty notes
- huge note rendering behavior
- grep on binary/non-md files (should skip)
- rewrite on non-existent note
- safe behavior in non-interactive mode

---

## 10) Instructions for Mr. Chris (GitHub + npm)

## A) Create the Git repo

```bash
cd /home/chris/Projects/pi-notes
git init
git add .
git commit -m "chore: initial pi-notes outline"
```

Create remote on GitHub, then:

```bash
git remote add origin git@github.com:<your-username>/pi-notes.git
git branch -M main
git push -u origin main
```

## B) Initialize npm package

```bash
npm init -y
```

Then edit `package.json` with final metadata/scripts.

If unscoped package name is unavailable, use scoped name:
- `@<your-scope>/pi-notes`

## C) npm login and publish (when ready)

```bash
npm login
npm publish --access public
```

For scoped packages, include `--access public`.

## D) Versioning strategy

- Start `0.1.0` until stable
- Use semver strictly
- Update CHANGELOG each release
- Tag releases in GitHub (`v0.1.0`, etc.)

---

## 11) Packaging Strategy for Pi

Ship as a proper pi package so users can install from npm/git cleanly.

README should include install examples for:

- npm package reference in pi settings
- git package reference in pi settings
- local development path usage

Keep extension entry stable and documented to avoid breaking installs.

---

## 12) Quality Bar Before First Public Release

Must pass:

- strict typecheck
- lint with zero warnings
- test suite green
- manual command smoke test in pi
- docs accurate with examples
- no destructive behavior without confirmation
- clear error messages for all invalid input paths

---

## 13) Non-Negotiables (Project Principles)

1. Deterministic by default
2. Explicit AI mutation only
3. Safe file/path handling always
4. Human-readable markdown storage
5. Strict TS/ESLint + CI enforced
6. Documentation as part of feature completion

---

## 14) Immediate Next Steps

1. Create baseline files:
   - `package.json`
   - `tsconfig.json`
   - ESLint config
   - `README.md`
   - `AGENTS.md`
   - `docs/` seed files
2. Implement storage primitives + tests
3. Implement `ls/show/new/append/rm`
4. Add `grep`
5. Add `rewrite` with preview confirmation
6. Prepare GitHub repo + npm metadata

---

This outline is intentionally detailed so we can execute quickly without rediscovering decisions later.
