# Brainstorm: Pi extension audit remediation

## Original user-provided brainstorm idea

> Create a detailed brainstorm based on the audit findings:
> `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/README.md` Start by reading all
> linked documents, then update the brainstorm.md in the order of the audit findings.
> Once done make a final pass to ensure all gaps are covered.

## Task intent

Remediate the full 2026-08-09 Pi extension audit as one coherent reliability and release-hardening effort. The package should make its filesystem boundary real, follow current Pi extension/package contracts, expose truthful tool and mode behavior, validate those contracts at Pi boundaries, and align documentation and release automation with what actually ships.

The audit is the source of identified gaps, not an implementation prescription. Where the audit offered alternatives, the tradeoffs were reviewed through `open-questions.md`; the confirmed choices are recorded below.

## Source context read

Audit index and all linked findings were read in this order:

1. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/security.md`
2. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/api.md`
3. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/package.md`
4. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/tools.md`
5. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/concurrency.md`
6. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/modes.md`
7. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/tests.md`
8. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/doc-mismatch.md`
9. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/docs.md`
10. `.pi/tasks/audits/2026-08-09-pi-notes-extension-audit/release.md`

Relevant implementation surfaces identified by the audit include `src/core/storage.ts`, `src/index.ts`, command handlers, package metadata, tests, public docs, and GitHub workflows.

## Desired outcomes

- A note operation cannot follow a planted symlink to read, overwrite, move, rename, create, or recursively remove content outside the intended notes roots.
- Agent mutations coordinate with Pi's shared file mutation queue while the standalone CLI retains deterministic local serialization.
- Abort signals prevent queued or long-running agent operations from continuing into unwanted filesystem changes.
- Registered tool schemas describe only behavior that is actually callable, and failed requested outcomes become Pi tool errors.
- Truncated tool output remains recoverable through a secure, documented mechanism.
- Package dependency metadata follows current Pi bundled-core conventions.
- `/notes`, agent tools, and CLI behavior are explicitly defined per TUI, RPC, JSON, and print mode.
- Tests cover the real extension/package boundaries rather than only internal helpers.
- Rebranded Pi config directories are either supported consistently or explicitly excluded from the contract.
- Public docs state actual guarantees and point only to real paths.
- Publishing requires an intentional, documented release action; CI and publish jobs use reproducible installs.

## Constraints and guiding principles

- Preserve the human-first notes model and project-first/global-fallback semantics unless a reviewed decision changes them.
- Keep destructive actions human-gated. Do not broaden the agent tool surface merely to make overwrite easier.
- Treat filesystem safety as a boundary property, not only a filename-validation property.
- Keep shared storage logic usable by both the Pi extension and standalone CLI; inject Pi-specific coordination rather than coupling every CLI operation to a running Pi host.
- Do not claim cross-process guarantees that the implementation cannot provide.
- Continue to use `@earendil-works/pi-coding-agent` APIs and strict TypeScript.
- Update generated `dist/` through the build, never by hand.
- Preserve the required validation gate: lint, typecheck, test, build.
- Do not add publishing, pushing, or unrelated CI behavior beyond the audited release corrections.

## Confirmed decisions

1. Reject symlinked config/storage directory components and note entries, including symlinks that resolve inside the intended root.
2. Remove `overwrite` from `notes_move` and `notes_rename`; hand destination conflicts to the user with exact interactive `/notes ... --overwrite` commands.
3. Prefer observable, mode-safe `/notes` results in print/JSON when Pi APIs can provide them without duplicate output or model-context pollution. Prototype that boundary; if it is not safe, emit an observable unsupported result and document the CLI as the headless interface.
4. Keep `.pi` as the standalone CLI default, inject Pi's `CONFIG_DIR_NAME` in extension mode, and allow only a narrowly validated explicit CLI override that avoids ambiguous migration behavior.
5. Store complete truncated output in owner-only OS temporary files with bounded retention sufficient for a follow-up read in the current session; never retain indefinitely or place artifacts in project storage.
6. Publish from `release.published` and protected `workflow_dispatch`, verify tag/version agreement, and use a protected GitHub environment when repository settings support it.

## Findings-driven brainstorming

### 1. Security: enforce the notes-root filesystem boundary

The highest-risk defect is that lexical name validation is correct but insufficient. Valid filenames can still be symlinks, and directory components such as `.pi` or `notes` can redirect operations. The resulting behavior turns append/edit/rewrite and overwrite move/rename into arbitrary writes with the user's permissions.

The safety model needs explicit invariants:

- The configured notes root must resolve to the intended scope root.
- Every existing path component used for a note operation must be checked under a deliberate symlink policy.
- The final note entry must not be a symlink when an operation expects a regular note file.
- Canonical containment must be rechecked inside the mutation window, not only during an earlier preflight.
- Reads deserve the same boundary protection as writes so showing/searching a note cannot disclose an external symlink target.
- Recursive scope removal must delete only the intended notes directory entry and never traverse an aliased external tree.
- Setup must not create directories or starter content through redirected components.

The confirmed policy is to reject symlinked storage components and note entries rather than permit symlinks that happen to resolve inside the root. This intentionally favors a strict, explainable regular-directory/regular-file contract over compatibility with intentionally symlinked note storage. Canonical containment and race-resistant operations are still required in addition to rejection checks.

Security tests should use temporary directories and cover file symlinks, directory symlinks, broken symlinks, destination symlinks, and component replacement races where deterministic hooks make those races testable. Platform-specific limitations should be explicit rather than silently skipping the entire safety contract.

### 2. Extension API: make truncated output recoverable

Pi's truncation limit is already applied, but the full captured result disappears. A correct contract needs both bounded model context and deterministic recovery.

Potential recovery designs:

- Write full rendered output to a secure temporary file and return its path plus truncation metadata. This follows the current Pi example and is the lowest-risk alignment choice.
- Add continuation/pagination parameters to read/list/search tools. This avoids temporary-file lifecycle concerns but is a broader tool API and storage-query design change.

The confirmed direction is a secure, owner-only OS temporary artifact with bounded retention long enough for a follow-up read in the current session. It must not be retained indefinitely or written inside project storage. Planning should define the deterministic cleanup mechanism while preserving this product constraint. The tool result should disclose line/byte limits and the artifact path, and `details` should expose structured truncation metadata for renderers/RPC clients.

Only commands capable of large output need limit language, but a shared adapter may make consistent descriptions simpler.

### 3. Package: align bundled-core dependency metadata

Current Pi package guidance treats `@earendil-works/pi-coding-agent` and `typebox` as host-provided core packages. The package should therefore use `"*"` peers for runtime imports while retaining pinned dev dependencies for reproducible repository checks.

Expected package shape:

- `peerDependencies`: coding agent and TypeBox at `"*"`.
- `devDependencies`: exact or intentionally ranged tested versions for coding agent and TypeBox.
- No runtime `dependencies` entry for TypeBox solely to support extension schema imports.
- Lockfile regenerated and package tests updated to assert host/core separation.

A package dry-run should verify that no unintended nested core runtime is bundled and that the npm tarball still contains everything required by both the TypeScript extension entry and compiled CLI.

### 4. Tools: make schemas and failure semantics truthful

#### Overwrite behavior

`overwrite` is exposed for `notes_move` and `notes_rename`, but tool execution is deliberately non-UI and therefore always blocks that parameter. The current skill simultaneously tells the agent to use it after confirmation, producing a guaranteed failure.

The confirmed product posture is to remove overwrite from agent tool schemas. On a destination conflict, the tool should explain the exact `/notes move ... --overwrite` or `/notes rename ... --overwrite` command the user can run interactively. This matches the existing destructive handoff for remove/uninstall and keeps agent tools safely non-destructive. An agent-side explicit-authorization design is out of scope.

#### Failure outcomes

The adapter currently infers domain success from UI notification severity. That conflates presentation with control flow. A missing target can be a warning in interactive UX while still being a failed requested tool operation.

The shared command layer should expose a typed outcome such as success/not-found/blocked/invalid/cancelled rather than forcing tools to scrape notifications. Adapters can then map:

- TUI/RPC command presentation to info/warning/error notifications.
- CLI outcomes to stdout/stderr plus exit code.
- Agent tool failures to thrown errors so Pi records `isError: true`.

No-match search and empty list are legitimate successful outcomes; missing target for show/append/move/rename is not. User cancellation of an interactive command should remain a clean cancellation, while impossible non-UI confirmation should be an explicit unsupported/blocked result.

### 5. Concurrency and cancellation: coordinate at the Pi boundary

#### Shared mutation queue

The private storage queue protects only operations using the same loaded class implementation and lexical key. It does not coordinate with Pi built-ins or aliases. The extension adapter needs to inject Pi's `withFileMutationQueue()` around the complete mutation window.

The storage core should retain a queue abstraction so:

- the extension composes Pi-wide and local serialization;
- the standalone CLI remains functional without importing host runtime behavior into every call;
- source/destination multi-path operations acquire keys in deterministic order;
- reads used to compute a mutation occur while the relevant queue is held;
- canonical path identity and symlink rejection agree rather than fight each other.

There is a design risk in naively nesting queues: acquiring private and Pi queues in inconsistent orders can deadlock. Planning must define one ownership/order model and test competing append/move/rename operations.

Cross-process CLI races remain outside an in-memory queue. Documentation should either state that limit or adopt filesystem locks/atomic replacement if cross-process guarantees become a requirement. The audit does not establish that broader requirement.

#### Cancellation

The execute signal should flow into the command/storage operation context. It should be checked:

- before queue acquisition;
- after waiting for a queue and before any mutation;
- between multi-file read/write/delete phases;
- during potentially large list/search reads where Node APIs support aborting.

A cancelled operation must not report success and must not start a mutation after cancellation. Once an atomic critical write has started, behavior should favor filesystem consistency, then report cancellation accurately; cancellation should not deliberately leave half-moved state.

### 6. Modes: define direct command behavior per host mode

The `/notes` command is observable in TUI and RPC because UI methods work there, but silent in print and JSON because notifications are no-ops. Exit success with no result is a poor automation contract.

The confirmed decision rule is to prefer direct extension commands that emit mode-safe observable results in print and JSON, provided a Pi API prototype proves this can avoid duplicated TUI/RPC output and model-context pollution. If that boundary cannot be made safe, direct `/notes` must emit an observable unsupported result and route deterministic headless use to `pi-notes` CLI or agent tools. Silent success is not acceptable in either outcome.

RPC should remain fully functional through the extension UI protocol. Mode tests should cover help/list/show, unknown command, missing note, destructive block, and interactive confirmation paths where supported.

### 7. Tests: shift confidence to integration boundaries

The existing 94 tests are useful but prove mostly internal behavior. Remediation needs targeted regression layers:

- Storage security: symlink and containment matrix for reads and every mutation family.
- Queueing: local concurrency plus extension integration with Pi shared queue semantics and alias identity.
- Cancellation: pre-aborted, queue-wait abort, scan abort, and mutation-boundary behavior.
- Tool contracts: registered schemas, conflict handoff, missing target errors, no-match success, truncation artifact recovery.
- Modes: real or close-to-real Pi print/JSON/RPC invocations without model/API dependency.
- Package: peer metadata, tarball contents, extension loading, CLI loading, and no bundled duplicate core runtime.
- Docs/release: workflow trigger assertions and command/docs contract checks where lightweight tests reduce drift.

Tests should avoid preserving obsolete behavior merely because it is current. They should assert desired upstream-aligned contracts and use deterministic temporary resources. Any spawned Pi tests must run offline and avoid requiring credentials.

### 8. Pi documentation mismatch: support configured config directories deliberately

The extension hardcodes `.pi`, contrary to Pi's rebranding/config-directory guidance. Extension execution can use exported `CONFIG_DIR_NAME`, but the standalone CLI does not inherently know which host distribution invoked it.

Confirmed contract:

- Extension adapter injects the host `CONFIG_DIR_NAME` into `NotesStorage` for project and global paths.
- Standalone `pi-notes` CLI defaults to `.pi` for backward compatibility and may accept a narrowly validated explicit config-dir override that avoids ambiguous data migration.
- Storage accepts a validated config directory name/path segment rather than embedding `.pi`.
- Public docs distinguish normal Pi defaults from configurable/rebranded host paths.

The global location follows the same decision as project storage; supporting only project rebranding would be internally inconsistent.

### 9. Extension documentation: state guarantees precisely

Documentation should be updated after behavior is fixed, not ahead of it. The coordinated pass should cover:

- `README.md`: surfaces, safe handoffs, mode support, storage/config-dir wording, truncation recovery.
- `docs/security.md`: canonical containment/symlink policy, destructive gates, cancellation boundary, residual trust assumptions.
- `docs/storage.md`: root resolution, regular-file requirements, queue scope, cross-process limitations, temp-output behavior if relevant.
- `docs/architecture.md`: typed command outcomes, injected queue/config/cancellation adapters.
- `docs/commands.md`: removed overwrite tool parameters, exact interactive handoff commands, mode matrix.
- `docs/release.md`: actual trigger and reproducible install path.
- `docs/README.md`: remove nonexistent `docs/plans/*` references and index real durable docs only.
- `CHANGELOG.md`: record user-visible contract changes in the eventual release entry.

Security language must distinguish lexical normalization, canonical containment, trust in the extension package, and remaining user-controlled filesystem permissions. Concurrency language must distinguish in-process/host queue coordination from cross-process locking.

### 10. Release: make publication intentional and reproducible

The workflow trigger and guide currently disagree. The confirmed model is `release.published` plus protected `workflow_dispatch`, replacing publication on pushes to a release branch. The workflow must verify release tag and package version agreement and use a protected GitHub environment when repository settings support it.

Release hardening should consider:

- trigger only on published GitHub Release and/or protected manual dispatch;
- verify release tag and `package.json` version agree before npm publish;
- optionally use a protected GitHub environment for human approval if repository policy supports it;
- retain minimal `contents: read` and `id-token: write` permissions for npm provenance;
- use `npm ci` in both CI and publish jobs;
- ensure the quality gate and package dry-run run against the same lockfile graph;
- document exactly which GitHub/npx trusted-publisher configuration is required.

The task should not publish anything. It should only correct and validate local workflow/docs behavior.

## Cross-finding dependencies

- The symlink policy determines canonical queue keys and several security tests.
- The typed command outcome design affects tools, CLI exit codes, TUI/RPC notifications, and print/JSON behavior.
- The overwrite decision affects schemas, skill guidance, command docs, and failure tests.
- The config-directory contract affects storage containment roots and docs.
- Truncation artifact handling introduces its own secure filesystem and retention requirements.
- Release trigger choice must be settled before workflow and docs can be aligned.

These dependencies favor resolving the material product/safety questions before implementation planning. Security and command-outcome decisions should lead because later work depends on them.

## Risks to manage

- A partial symlink fix can create a false sense of safety while retaining race windows.
- Queue layering can deadlock or serialize the wrong path if acquisition ownership is unclear.
- Temp output artifacts can leak note contents if permissions or lifecycle are weak.
- Changing tool failure semantics may affect existing agent workflows and session expectations.
- Removing overwrite parameters is a tool API change and should be documented as intentional.
- Rebranded config support can accidentally move existing users' data if defaults change.
- Mode output changes can duplicate messages or pollute model context.
- Workflow trigger changes cannot be fully proven locally; static tests and a documented manual verification path are needed.

## Final coverage pass

All linked audit gaps are represented:

- security symlink escape;
- truncation recovery and description contract;
- Pi core peer dependency metadata;
- overwrite schema mismatch;
- false-success tool outcomes;
- Pi shared mutation queue integration;
- abort signal handling;
- print/JSON silence and RPC compatibility;
- missing boundary tests and obsolete assertions;
- `CONFIG_DIR_NAME` alignment;
- overstated docs and stale docs index;
- publish trigger mismatch and `npm ci` consistency.

No implementation plan, specs, tickets, or code changes are included at this stage.

## Human review gate

All material brainstorm questions have confirmed answers and `open-questions.md` is clear. The task remains in the lifecycle's `blocked` Q&A state so the human can select the next `/tasks` action; it is ready for implementation planning.
