# Stories: pi-notes audit remediation

## Story 1: Package user can load the extension

As a Pi user, I want the installed pi-notes package to import the same Pi APIs documented by current Pi docs so the extension loads reliably outside the development checkout.

Acceptance criteria:

- Current documented Pi import paths are used when compatible.
- Dependency metadata reflects runtime/peer expectations.
- A smoke test catches unresolved extension-entry imports.

## Story 2: Agent sees note tool failures as failures

As an agent, I want failed note tool operations to be reported through Pi tool error semantics so I do not mistake a failed mutation for a successful result.

Acceptance criteria:

- Command-domain errors throw from custom tool execution.
- Tests assert rejection/failure for a duplicate create or equivalent error.

## Story 3: Agent receives bounded note output

As an agent, I want large note outputs truncated so note tools do not overwhelm model context.

Acceptance criteria:

- Shared tool output is bounded by documented/default limits or equivalent local constants.
- Truncated output contains a clear marker.
- Tests cover large output.

## Story 4: Parallel mutations do not race unpredictably

As a user, I want concurrent note mutations to serialize by note file so agent parallelism does not lose updates or move/rename stale data.

Acceptance criteria:

- Same-note mutation paths share canonical queue keys.
- Multi-file operations acquire keys deterministically.
- Regression tests cover representative concurrent races.

## Story 5: Maintainer docs match shipped behavior

As a maintainer, I want README and architecture/command docs to describe tool-first behavior so future agents and users understand the extension contract.

Acceptance criteria:

- README/docs mention `notes_*` tools and fallback commands.
- Hidden aliases remain undocumented.
