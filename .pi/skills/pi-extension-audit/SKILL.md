---
name: pi-extension-audit
description: Audit Pi extension and package projects against current Pi coding-agent docs and record evidence-backed findings.
user-invocable: true
metadata:
  version: "1.0.0"
---

# Pi Extension Audit

## Purpose
Audit Pi extension/package projects for Pi-specific correctness, security, maintainability, and documentation alignment.

## Use when
- User asks to audit a Pi extension or Pi package.
- User asks whether extension code/docs match current Pi coding-agent docs.
- User wants audit findings that can feed `task-brainstorm` or another task lifecycle.

## Inputs to read
- Current project files: `package.json`, `.pi/settings.json`, `.pi/extensions/`, `extensions/`, `skills/`, `prompts/`, `themes/`, README/docs, tests, release config.
- Current Pi docs relevant to the audit scope.
- Current Pi examples relevant to the audit scope.
- User-provided audit target and optional tasks-root path.

Useful Pi docs by scope:

| Scope | Start with |
| --- | --- |
| Security / permissions | `docs/extensions.md`, `docs/packages.md`, `docs/settings.md`, `docs/usage.md` |
| Extension API | `docs/extensions.md`, `docs/session-format.md`, `docs/compaction.md`, `examples/extensions/` |
| Package/install/discovery | `docs/packages.md`, `docs/extensions.md`, `docs/skills.md`, `docs/prompt-templates.md`, `docs/themes.md` |
| Tools/commands | `docs/extensions.md`, `docs/rpc.md`, `docs/json.md`, `docs/tui.md` |
| Lifecycle/session/reload | `docs/extensions.md`, `docs/sessions.md`, `docs/session-format.md`, `docs/compaction.md` |
| Concurrency/cancellation | `docs/extensions.md`, `docs/tmux.md`, `docs/development.md` |
| Print/RPC/TUI modes | `docs/extensions.md`, `docs/rpc.md`, `docs/json.md`, `docs/tui.md`, `docs/usage.md` |
| State persistence | `docs/extensions.md`, `docs/session-format.md`, `docs/settings.md` |
| Errors/failures | `docs/extensions.md`, `docs/rpc.md`, `docs/tui.md`, `docs/usage.md` |
| Tests/flakiness | `docs/development.md`, `examples/extensions/` |
| Quality/maintainability | `docs/extensions.md`, `docs/packages.md`, `docs/development.md` |
| Doc mismatch | `docs/index.md`, `docs/extensions.md`, `docs/packages.md`, scope docs |
| Extension docs/examples | `docs/extensions.md`, `docs/packages.md`, `docs/skills.md`, `docs/prompt-templates.md`, `docs/themes.md`, `examples/` |
| Release/dependencies | `docs/packages.md`, `docs/development.md`, `docs/models.md` when provider/model packaging is involved |

Follow related docs/examples when the project uses additional Pi surfaces.

## Execution steps
1. Resolve a tasks root before writing audit files:
   - If the user provided a path, verify it exists; if not, hard stop and report it.
   - Else if `.pi/tasks/` exists and `task-brainstorm` exists, use `.pi/tasks/`.
   - Else if `task-brainstorm` exists, read `.pi/pi-tasks.json` and use `tasksRoot` when present.
   - Else hard stop and ask for the path to save audit files.
2. Create audit directory: `<tasks-root>/audits/<yyyy>-<mm>-<dd>-<slug>/`.
3. Read relevant current Pi docs before each audit point.
4. Audit one point at a time using these filenames only when findings exist:
   - `security.md` — security / permission risk
   - `api.md` — Pi extension API correctness
   - `package.md` — Pi package / install / discovery correctness
   - `tools.md` — tool and command contract correctness
   - `lifecycle.md` — lifecycle, session, and reload correctness
   - `concurrency.md` — concurrency, cancellation, and long-running process safety
   - `modes.md` — print mode / RPC mode / TUI compatibility
   - `state.md` — state persistence and data migration
   - `errors.md` — error handling and user-facing failure modes
   - `tests.md` — test coverage and flakiness
   - `quality.md` — code quality and maintainability
   - `doc-mismatch.md` — Pi coding-agent documentation misalignment
   - `docs.md` — extension documentation / examples / README accuracy
   - `release.md` — release, versioning, and dependency hygiene
5. For each finding file, include: affected paths, observed behavior, expected Pi/documented behavior, impact, and recommended remediation.
6. Do not create files for clean/no-finding audit points.
7. Create `README.md` with a table of contents that links only finding files. If a no-finding file exists, do not link it.
8. Final response:
   - If `task-brainstorm` exists, include:
     `Use /skill:task-brainstorm Create a detailed brainstorm based on the audit findings: <tasks-root>/audits/<yyyy>-<mm>-<dd>-<slug>/README.md Start by reading all linked documents, then update the brainstorm.md in the order of the audit findings. Once done make a final pass to ensure all gaps are covered.`
   - Otherwise say: `Audit completed: <tasks-root>/audits/<yyyy>-<mm>-<dd>-<slug>/README.md`

## Validation
- Tasks root exists before writing.
- Audit directory follows `<tasks-root>/audits/<yyyy>-<mm>-<dd>-<slug>/`.
- Each finding cites source paths and relevant Pi docs.
- `README.md` links only finding files.
- No clean/no-finding files are created.
- No audited extension files are changed unless the user explicitly requested fixes.

## Guardrails
- This is an audit skill, not a fix skill.
- Do not infer Pi behavior from memory when docs are available.
- Do not edit derived global task state.
- Do not invent findings; use evidence from code/docs.
- Ask before destructive, external, or broad project changes.
- Never include secrets in findings.
