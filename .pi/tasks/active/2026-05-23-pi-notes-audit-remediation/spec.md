# Spec: pi-notes audit remediation

## Goal

Remediate the Pi extension audit findings for `pi-notes` so package metadata/imports, agent tool behavior, mutation concurrency, and documentation match current Pi extension expectations.

## Scope

- Align Pi-related imports/dependencies with current documented package names where compatible.
- Ensure custom note tools signal execution failures by throwing from tool execution.
- Truncate custom tool output before returning it to the model.
- Improve storage mutation serialization so same-note operations do not race through operation-specific queues.
- Update README and docs to describe tool-first agent behavior accurately.
- Add or update tests for each behavior change.

## Non-goals

- No publishing, npm release, or CI changes.
- No destructive agent tools (`rm`, `uninstall`, rewrite/edit).
- No public documentation of hidden aliases `/notes add` or `/notes list`.
- No broad command/parser redesign unrelated to the audit.

## Source/context paths

- `package.json`
- `package-lock.json`
- `src/index.ts`
- `src/commands/notes.ts`
- `src/core/storage.ts`
- `tests/tools.test.ts`
- `tests/package-resources.test.ts`
- `README.md`
- `docs/commands.md`
- `docs/architecture.md`
- `skills/pi-notes/SKILL.md`
- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/package.md`
- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/tools.md`
- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/concurrency.md`
- `.pi/tasks/audits/2026-05-23-pi-notes-extension-audit/docs.md`

Pi docs:

- `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md`
- `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`
- `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/json.md`

## Implementation approach

1. Update Pi package import paths and dependency metadata first. Verify the documented packages resolve locally before changing source imports. If they do not resolve or cannot be installed safely, stop and record a gap.
2. Update `src/index.ts` shared tool adapter so command-domain error notifications throw an `Error` from `execute`, and so text content is truncated before returning.
3. Refactor `NotesStorage` mutation queues from operation-prefixed keys toward canonical note/scope/path keys. Multi-file mutations must acquire keys in deterministic order.
4. Refresh README/docs after behavior is implemented, keeping user-facing command docs separate from agent-facing tool docs.

## Constraints

- Preserve CLI and slash command UX unless the audit explicitly requires tool-specific behavior.
- Preserve project/global/default scope semantics.
- Keep hidden aliases undocumented.
- Use repository scripts for validation.
- Keep changes focused to audit remediation.

## Risks and assumptions

- Dependency migration may be blocked by package availability or lockfile compatibility.
- Pi truncation helpers may not be exported from the same module as extension types; equivalent local truncation may be acceptable only if small and documented.
- Storage-level queueing may need a two-phase source resolution for default scope moves/renames; re-check source state inside the queued mutation to avoid stale reads.

## Validation matrix

| Area | Validation |
| --- | --- |
| Import/dependency alignment | Typecheck/build pass; smoke test catches unresolved source extension imports. |
| Tool error signaling | Tool-domain duplicate/error case rejects/throws instead of resolving with `ok: false`. |
| Tool truncation | Large show/list/grep output is shortened with a visible truncation marker. |
| Mutation concurrency | Concurrent same-note mutation tests produce deterministic results or deterministic errors. |
| Documentation | README/docs mention tool-first behavior and do not expose hidden aliases. |
| Full suite | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`. |

## Definition of done

- All four tickets are implemented with evidence recorded in ticket folders.
- Full validation suite passes.
- No unresolved root `gaps.md` remains.
- Documentation matches final behavior.
