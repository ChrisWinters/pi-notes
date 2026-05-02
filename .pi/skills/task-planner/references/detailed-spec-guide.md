# Detailed Spec Guide

This guide is a non-required aid for creating stronger `spec.md` files. It is inspired by the structure and rigor of the Symphony Service Specification, but it should be adapted to the size, risk, and domain of the work.

A good spec is an execution contract: a future agent or human should be able to read it, understand the problem, know what is in and out of scope, implement safely, and validate completion without needing hidden context.

## Principles

- Be explicit about boundaries. State what the work does, what it does not do, and where responsibility stops.
- Prefer source-anchored facts over narrative assumptions. Reference files, commands, data shapes, interfaces, and current behavior.
- Separate required behavior from recommendations. Use words such as `must`, `should`, `may`, and `optional` consistently.
- Make implementation-defined choices visible. If there are multiple acceptable policies, name the decision and require it to be documented.
- Define observable success. Include logs, states, command outputs, UI behavior, API responses, metrics, or file changes that prove the work is complete.
- Include recovery and failure behavior. Strong specs describe what happens when dependencies fail, inputs are invalid, or work is interrupted.
- Keep the spec testable. Every requirement should be verifiable by review, command, test, or manual check.

## Recommended spec sections

Use only the sections that fit the work. Large or risky changes should include most of them; small changes can collapse sections while preserving the same intent.

### 1. Status and purpose

Include:

- current status: draft, approved, in progress, completed, superseded
- owner or requester, if relevant
- short purpose statement
- one-paragraph summary of the desired outcome

### 2. Normative language

For rigorous specs, define requirement keywords:

- `must` / `required`: mandatory for completion
- `must not`: prohibited
- `should` / `recommended`: expected unless there is a documented reason
- `may` / `optional`: allowed but not required
- `implementation-defined`: the implementation must choose and document a behavior

This helps agents distinguish hard requirements from helpful guidance.

### 3. Problem statement

Describe the current problem in operational terms:

- what is broken, missing, slow, risky, confusing, or expensive
- who or what is affected
- current workflow or code behavior
- why now
- important boundaries and assumptions

A strong problem statement avoids jumping straight to implementation.

### 4. Goals and non-goals

Goals define success. Non-goals prevent scope creep.

Good goals are concrete:

- support a specific flow
- add a specific contract
- preserve a specific invariant
- expose a specific observable signal
- reduce a specific manual step

Good non-goals are explicit:

- no UI redesign
- no data migration
- no new service dependency
- no behavior change outside listed paths
- no optimization beyond current requirements

### 5. Current system overview

Document existing behavior before prescribing changes:

- relevant components
- data flow
- control flow
- storage locations
- user-facing flows
- external dependencies
- known constraints

Reference code paths and configuration files directly.

### 6. Proposed system overview

Describe the target shape at a high level:

- components to add, change, or remove
- ownership boundaries between components
- major decisions
- how the proposed flow differs from the current flow
- how compatibility is preserved or intentionally broken

### 7. Domain model and terminology

Define important concepts, entities, state names, IDs, file formats, and terms.

Include for each key entity:

- name
- purpose
- required fields or attributes
- lifecycle
- invariants
- normalization rules, if any

This is especially useful when multiple files or services use the same concept differently.

### 8. Contracts and interfaces

Specify the contracts that implementation must satisfy:

- files and paths
- commands and arguments
- APIs and payloads
- config keys and defaults
- events and logs
- UI states
- database records
- environment variables
- integration boundaries

For each contract, include required behavior, validation rules, and error handling.

### 9. Configuration and defaults

When configuration is involved, define:

- resolution order
- default values
- required values
- environment variable indirection
- reload behavior
- validation errors
- precedence rules

State whether invalid config blocks startup, blocks only a feature, or falls back to defaults.

### 10. State machine or lifecycle

For workflows with states, define:

- states
- allowed transitions
- transition triggers
- terminal states
- retry states
- cancellation/interruption behavior
- idempotency rules
- startup/recovery behavior

A lifecycle table is often clearer than prose.

### 11. Algorithms and flows

Include reference algorithms for complex behavior. Keep them language-agnostic unless the implementation language matters.

Useful flows:

- startup
- main execution path
- validation
- retry/backoff
- reconciliation
- cleanup
- shutdown
- rollback or recovery

### 12. Safety, security, and trust boundaries

Document operational safety explicitly:

- filesystem boundaries
- destructive actions
- secrets handling
- permission requirements
- sandboxing or approval assumptions
- user confirmation points
- external service writes
- data retention
- privacy constraints

If the project intentionally trusts a high-permission environment, say so and state compensating controls.

### 13. Observability and debugging

Define how operators or developers know what happened:

- structured logs
- human-readable status
- metrics
- debug files
- trace IDs or correlation IDs
- command output capture
- error messages
- health checks

Include minimum required observability for completion.

### 14. Failure model and recovery

List expected failure classes and required responses:

- invalid input
- missing config
- dependency unavailable
- partial write
- interrupted process
- timeout
- permission denied
- stale state
- duplicate execution

For each class, define whether to retry, fail fast, skip, roll back, preserve artifacts, or require operator intervention.

### 15. Test and validation matrix

Create a matrix that maps requirements to validation.

At minimum include:

- unit tests
- integration tests
- manual checks
- lint/typecheck/build commands
- migration checks, if applicable
- failure-path tests
- regression checks for existing behavior

Each test should identify what it proves.

### 16. Implementation plan and slicing guidance

Break the work into ticket-sized slices:

- preparatory refactors
- contract/schema changes
- core implementation
- integrations
- observability
- validation
- docs/reconciliation

Each slice should be independently reviewable and should leave the system in a coherent state.

### 17. Definition of done

List the required completion criteria:

- implemented behavior
- preserved invariants
- tests passing
- docs updated
- plan files reconciled
- known gaps recorded
- rollout or operator notes added

Separate required completion items from recommended follow-ups.

## Quality checklist

Before using a spec for execution, verify:

- [ ] The problem is clear without external context.
- [ ] Goals and non-goals are explicit.
- [ ] Relevant source paths are listed.
- [ ] Required behavior is distinguishable from optional guidance.
- [ ] Interfaces, config, data shapes, and states are specified where relevant.
- [ ] Failure behavior is described.
- [ ] Security and safety boundaries are documented.
- [ ] Validation commands and expected evidence are listed.
- [ ] Ticket slices can be derived from the spec.
- [ ] Open questions are visible and do not hide implementation blockers.

## Common weaknesses to avoid

- Vague goals such as "make it better" or "improve UX" without observable criteria.
- Specs that describe only the happy path.
- Hidden dependencies on Slack, memory, old plans, or unstated conventions.
- Requirements that cannot be validated.
- Missing non-goals, causing unrelated work to enter the plan.
- Over-prescribing implementation details when a contract-level requirement is enough.
- Under-prescribing safety behavior for destructive or external actions.
- Forgetting startup, retry, cancellation, and cleanup behavior for long-running flows.

## How this guide fits task planning

When creating task-planner outputs:

- `spec.md` should hold the master execution contract.
- `prd.md`, `stories.md`, and `tickets.md` should derive from `spec.md`.
- `tickets.md` should convert spec sections into bounded implementation slices.
- Ticket `evidence.md` files should cite validation commands from the spec's validation matrix.
- Final reconciliation should compare completed work back to the spec's definition of done.
