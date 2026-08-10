# Architecture

`pi-notes` is a Pi extension with tool-first agent support, a `/notes` command family, a standalone package CLI, and a shared storage core.

## Modules

- `extensions/pi-notes/index.ts` — package extension entrypoint.
- `src/index.ts` — registers `/notes` with `pi.registerCommand` and `notes_*` with `pi.registerTool`, injects Pi configuration/queueing, adapts outcomes, and bounds tool output.
- `src/cli.ts` — standalone `pi-notes` adapter with `.pi` compatibility defaults.
- `src/commands/` — parser, typed command outcomes, UI abstraction, and handlers.
- `src/core/storage.ts` — scope resolution, regular-path validation, containment, and note lifecycle.
- `src/core/mutation.ts` — deterministic multi-path coordination abstraction and local queue.
- `src/core/output-artifact.ts` — private temporary recovery artifacts and bounded cleanup.
- `src/core/naming.ts` / `format.ts` / `errors.ts` — names, markdown frontmatter, and domain errors.
- `src/ui/render.ts` — textual list/show/search/rewrite rendering.
- `skills/pi-notes/SKILL.md` — packaged tool-first routing and destructive handoffs.

## Data flow

1. `/notes`, `notes_*`, or `pi-notes` maps input into the shared parser and handlers.
2. Handlers report an explicit `success`, `failure`, or `cancelled` outcome independently of notification severity.
3. Storage validates lexical names, rejects symlink/wrong-type paths, checks canonical containment, and runs mutations through an injected coordinator.
4. Extension mutations use Pi's `withFileMutationQueue()`; standalone/internal storage uses deterministic in-process coordination.
5. TUI/RPC commands use UI notifications and dialogs. CLI maps outcomes to output and exit status. Tools throw on non-successful outcomes.
6. Tool text is truncated to Pi's 2,000-line/50KB limits. Complete truncated text is placed in a private temporary artifact for 24-hour recovery.

## Mode behavior

- **TUI:** notifications, confirmation, and editor flows are supported.
- **RPC:** Pi's extension UI protocol receives the same notifications/dialog requests without a second output transport.
- **Print/JSON:** direct `/notes` commands are intentionally unsupported because command return values have no documented output channel, UI calls are no-ops, and `pi.sendMessage()` would add model context. The handler throws an observable stderr error with the equivalent `pi-notes ...` command. JSON protocol stdout remains unmodified.
- **Tools:** return bounded model-visible results and structured details; failures throw for Pi `isError` handling.

## Trust and concurrency boundaries

Pi extensions execute with the user's permissions. Storage confinement protects note operations from symlink/path redirection; it is not a sandbox for other extension code or compromised processes.

Pi-hosted operations coordinate with Pi's mutation queue. CLI operations in one process coordinate locally. Separate CLI processes and unrelated programs are not locked by pi-notes.
