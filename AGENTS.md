# AGENTS.md

Guidance for coding agents working in the `pi-notes` repository.

## Project Identity

- **What it is:** A strict TypeScript Pi extension and standalone CLI published as `@tribalnerd/pi-notes`.
- **What it does:** Provides `/notes`, agent-facing `notes_*` tools, and CLI commands for project/global Markdown notes.
- **Purpose:** Keep lightweight human notes close to coding work with predictable scope resolution and safe filesystem behavior.
- **Users:** Pi users, coding agents using the registered tools, and CLI users.
- **Current goals:** Preserve a small, human-first notes workflow; keep extension, tool, CLI, storage, package, and documentation contracts aligned.

Do not add speculative product behavior or expand the agent tool surface into destructive/editor flows without an explicit feature decision.

## Required Startup Context

Before planning or editing, read:

1. `README.md` — supported surfaces, commands, scopes, and user-facing behavior.
2. `package.json` — scripts, package metadata, Pi entrypoints, and compatibility.
3. `src/index.ts` — extension registration, tool contracts, Pi integrations, and output limits.
4. `docs/agent-docs.yaml` — scan-first architecture and contract map.
5. Relevant implementation, tests, and current-state docs for the task.

Use implemented code and current configuration as the source of truth. Plans and historical task artifacts are secondary.

## Operating Model

```text
/notes command, notes_* tool, or pi-notes CLI
  → shared parser and typed command handler
  → storage scope resolution and safety checks
  → coordinated filesystem operation
  → UI notification, tool result/error, or CLI output/status
```

- Handlers report `success`, `failure`, or `cancelled` independently of notification severity.
- Default reads prefer project scope and fall back to global; list/search merge both with project precedence.
- Extension mode injects Pi's `CONFIG_DIR_NAME` and `withFileMutationQueue()`.
- CLI mode intentionally retains `.pi` roots and process-local coordination.

## Architecture Map

- `extensions/pi-notes/index.ts` — packaged Pi entrypoint; re-exports `src/index.ts`.
- `src/index.ts` — registers `/notes` and eight `notes_*` tools; adapts outcomes and bounded output.
- `src/cli.ts` — non-interactive package CLI and exit-status adapter.
- `src/commands/` — parser, context/outcomes, shared command contracts, and handlers.
- `src/core/storage.ts` — note lifecycle, scope selection, path validation, and containment.
- `src/core/mutation.ts` — sorted multi-path coordination and local queue fallback.
- `src/core/output-artifact.ts` — private temporary recovery artifacts and retention cleanup.
- `src/core/naming.ts`, `format.ts`, `errors.ts` — naming, Markdown/frontmatter, and domain errors.
- `src/ui/render.ts` — textual command/tool rendering.
- `skills/pi-notes/SKILL.md` — bundled agent routing and human-handoff policy.
- `tests/` — offline unit, integration, Pi-mode, package, and workflow contract coverage.
- `docs/` — current user, architecture, storage, security, and release contracts.

## Public Contracts

- Slash command family is `/notes`; never document `/pi-notes` as a slash command.
- Agent tools are `notes_setup`, `notes_list`, `notes_show`, `notes_new`, `notes_append`, `notes_grep`, `notes_rename`, and `notes_move`.
- Delete, uninstall, edit, rewrite, and overwrite confirmation remain human-facing command/CLI flows.
- Agent rename/move schemas expose no overwrite option; conflicts return an exact interactive `/notes ... --overwrite` handoff.
- Tool list/show/grep output, including recovery notice, must remain within 2,000 lines and 50KB.
- Scope and edge-only flag parsing are compatibility contracts; preserve literal `--` behavior.
- Update implementation tests, `README.md`, relevant `docs/*.md`, and `docs/agent-docs.yaml` when public behavior changes.

## Data and Runtime Principles

- Extension roots are `<cwd>/<CONFIG_DIR_NAME>/notes` and `~/<CONFIG_DIR_NAME>/notes`; CLI roots remain `.pi/notes` and `~/.pi/notes`.
- Notes are Markdown with required `title` and `updated` frontmatter; `tags` is optional.
- Reject unsafe names, symlinks (including broken links), wrong path types, and containment escapes. Never weaken fail-closed checks to make a test pass.
- Protect complete read-modify-write windows. Multi-path operations acquire unique sorted identities.
- Do not claim serialization across separate CLI processes or unrelated programs.
- Full truncated output belongs in owner-only OS temporary artifacts, never in note storage or model-visible unbounded output.
- Cancellation before mutation must leave files unchanged; preserve move/rename coherence once their indivisible mutation phase starts.

## Responsibility Boundaries

Project code is responsible for:

- Deterministic parsing, scope resolution, typed outcomes, safe storage access, and bounded output.
- Human confirmation boundaries for destructive and overwrite operations.
- Pi-host queue integration plus truthful documentation of CLI-local limitations.

Pi, the host OS, and users are responsible for:

- Pi UI/protocol behavior, host configuration naming, and shared queue implementation.
- OS/account security and eventual cleanup when no host process is alive.
- Explicitly confirming destructive operations and configuring external release protections.

## Development Workflow

1. Inspect relevant source, tests, docs, and configuration before planning.
2. Keep changes focused on the pi-notes extension contract.
3. Use strict TypeScript and `@earendil-works/pi-coding-agent` APIs; preserve Node.js 20+ compatibility.
4. Add or update deterministic offline tests for behavior changes. Use temporary HOME/project roots; never use real note storage as a fixture.
5. Update current-state docs when commands, tools, storage, security, modes, package, or release behavior changes.
6. Keep `package-lock.json` synchronized with dependency changes and use npm workflows.

`dist/` is generated by `npm run build` and ignored by Git. Do not hand-edit it.

## Validation

Before handing off implementation changes, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

CI uses `npm ci --no-audit --no-fund` and the same four checks. For package/release changes, also inspect `npm pack --dry-run --json --ignore-scripts` and relevant workflow tests.

## Safety Notes

- Keep `rm`, `uninstall`, overwrite, edit, and rewrite safeguards human-gated.
- Do not manually mutate `.pi/notes` or `~/.pi/notes` during development or tests.
- Do not add network synchronization, background behavior, publishing, pushing, deployment, or CI changes unless explicitly requested.
- Do not invent a protected GitHub environment name or weaken release tag/version verification.
- Do not expose credentials, private note contents, or temporary full-output artifacts in logs or fixtures.
