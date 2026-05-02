# Detailed Spec Template

> This template is optional guidance for creating a strong `spec.md`. Delete sections that do not apply. Keep the final spec source-anchored, testable, and proportional to the work.

# <Project or Change Name> Specification

Status: Draft
Owner/requester: <name or role>
Last updated: <YYYY-MM-DD>

Purpose: <one sentence describing what this spec enables or changes>

Summary:

<One short paragraph describing the desired outcome, affected system, and expected result.>

## Normative Language

Use these meanings when interpreting this spec:

- `must` / `required`: mandatory for completion.
- `must not`: prohibited.
- `should` / `recommended`: expected unless a documented reason exists.
- `may` / `optional`: allowed but not required.
- `implementation-defined`: the implementation must choose and document the behavior.

## 1. Problem Statement

### 1.1 Current problem

<Describe the current issue, missing capability, operational pain, or risk.>

### 1.2 Affected users or systems

- <user/system/team>
- <user/system/team>

### 1.3 Current behavior

- <observable current behavior>
- <relevant source path, command, endpoint, screen, or process>

### 1.4 Important boundaries

- <what this spec is responsible for>
- <what adjacent system remains responsible for>
- <trust, safety, or operational assumptions>

## 2. Goals and Non-Goals

### 2.1 Goals

- <specific, observable goal>
- <specific, observable goal>
- <specific, observable goal>

### 2.2 Non-goals

- <explicitly out-of-scope item>
- <explicitly out-of-scope item>
- <explicitly out-of-scope item>

## 3. Context and Current System Overview

### 3.1 Relevant source paths

- `<path>` — <why it matters>
- `<path>` — <why it matters>
- `<path>` — <why it matters>

### 3.2 Current components

1. `<component>`
   - Responsibility: <current responsibility>
   - Important behavior: <behavior>

2. `<component>`
   - Responsibility: <current responsibility>
   - Important behavior: <behavior>

### 3.3 Current flow

1. <step>
2. <step>
3. <step>

### 3.4 External dependencies

- <service/library/tool/config>
- <service/library/tool/config>

## 4. Proposed System Overview

### 4.1 Target behavior

<Describe the intended end state at a high level.>

### 4.2 Components to change

1. `<component/path>`
   - Change: <what changes>
   - Responsibility after change: <responsibility>

2. `<component/path>`
   - Change: <what changes>
   - Responsibility after change: <responsibility>

### 4.3 New or changed flow

1. <step>
2. <step>
3. <step>

### 4.4 Compatibility

- Backward compatibility requirements: <requirements or none>
- Migration requirements: <requirements or none>
- Rollback considerations: <considerations or none>

## 5. Domain Model and Terminology

### 5.1 Terms

- `<term>`: <definition>
- `<term>`: <definition>

### 5.2 Entities

#### 5.2.1 `<Entity>`

Purpose: <why it exists>

Fields/attributes:

- `<field>`: <type/meaning/required or optional>
- `<field>`: <type/meaning/required or optional>

Lifecycle:

- <created when>
- <updated when>
- <deleted/archived when>

Invariants:

- <must always be true>
- <must always be true>

### 5.3 Identifiers and normalization rules

- <ID format, slug format, case normalization, path normalization, etc.>

## 6. Contracts and Interfaces

### 6.1 Files and paths

- `<path>`
  - Required: <yes/no>
  - Format: <format>
  - Read/write behavior: <behavior>
  - Validation: <validation rule>

### 6.2 Commands or CLI behavior

Command:

```bash
<command example>
```

Required behavior:

- <behavior>
- <behavior>

Error behavior:

- <error case> → <required response>

### 6.3 APIs, events, or messages

Endpoint/event/message: `<name>`

Request/input:

```text
<shape or example>
```

Response/output:

```text
<shape or example>
```

Rules:

- <validation rule>
- <error handling rule>

### 6.4 UI or human-facing contract

- Screen/location: <where>
- Required visible state: <what users see>
- Required interactions: <what users can do>
- Empty/error/loading states: <required behavior>

## 7. Configuration

### 7.1 Config fields

| Field | Required | Default | Source | Description |
| --- | --- | --- | --- | --- |
| `<field>` | yes/no | `<default>` | `<file/env/etc>` | <description> |

### 7.2 Resolution order

1. <highest precedence>
2. <next precedence>
3. <default/fallback>

### 7.3 Validation

- <invalid config case> → <error or fallback behavior>
- <invalid config case> → <error or fallback behavior>

### 7.4 Reload behavior

<Describe whether config is loaded once, hot-reloaded, or applied on restart only.>

## 8. State Machine or Lifecycle

### 8.1 States

| State | Meaning | Terminal? |
| --- | --- | --- |
| `<state>` | <meaning> | yes/no |
| `<state>` | <meaning> | yes/no |

### 8.2 Transitions

| From | Trigger | To | Required side effects |
| --- | --- | --- | --- |
| `<state>` | <trigger> | `<state>` | <side effects> |

### 8.3 Idempotency and recovery

- <operation> must be safe to repeat because <reason/mechanism>.
- <interrupted state> recovers by <behavior>.

## 9. Algorithms and Detailed Behavior

### 9.1 Startup or initialization

1. <step>
2. <step>
3. <step>

### 9.2 Main flow

1. <step>
2. <step>
3. <step>

### 9.3 Validation flow

1. <step>
2. <step>
3. <step>

### 9.4 Cleanup or shutdown

1. <step>
2. <step>
3. <step>

## 10. Safety, Security, and Trust Boundaries

### 10.1 Trust assumptions

- <assumption>
- <assumption>

### 10.2 Filesystem and destructive-action safety

- <paths that may be read/written>
- <paths that must not be modified>
- <confirmation requirements, if any>

### 10.3 Secret handling

- <where secrets may come from>
- <what must not be logged or committed>
- <redaction requirements>

### 10.4 External writes

- <external system writes allowed>
- <external system writes prohibited>
- <operator approval requirements>

## 11. Observability and Debugging

### 11.1 Required logs or status output

- <event/status> with <fields/details>
- <event/status> with <fields/details>

### 11.2 Metrics or counters

- <metric/counter> — <meaning>

### 11.3 Debug artifacts

- `<path or artifact>` — <when created and what it contains>

### 11.4 Error messages

Error messages should include:

- <context field>
- <actionable next step>
- <correlation ID or path, if relevant>

## 12. Failure Model and Recovery

| Failure class | Example | Required behavior | Validation |
| --- | --- | --- | --- |
| Invalid input | <example> | <fail/retry/skip behavior> | <test/check> |
| Missing dependency | <example> | <fail/retry/skip behavior> | <test/check> |
| Partial write | <example> | <reconcile/rollback behavior> | <test/check> |
| Timeout | <example> | <retry/cancel behavior> | <test/check> |

## 13. Test and Validation Matrix

| Requirement | Validation method | Command/check | Expected evidence |
| --- | --- | --- | --- |
| <requirement> | unit/integration/manual | `<command>` | <expected result> |
| <requirement> | unit/integration/manual | `<command>` | <expected result> |

### 13.1 Required validation commands

```bash
<lint/typecheck/test command>
<integration/manual check command>
```

### 13.2 Manual validation

- [ ] <manual check>
- [ ] <manual check>

## 14. Implementation Plan and Ticket Slices

### 14.1 Suggested sequence

1. <slice name> — <purpose and files likely affected>
2. <slice name> — <purpose and files likely affected>
3. <slice name> — <purpose and files likely affected>

### 14.2 Slice boundaries

- Each slice should be independently reviewable.
- Each slice should update ticket notes and evidence.
- Each slice should preserve a working repository state.

## 15. Risks, Assumptions, and Open Questions

### 15.1 Risks

- <risk> — mitigation: <mitigation>
- <risk> — mitigation: <mitigation>

### 15.2 Assumptions

- <assumption>
- <assumption>

### 15.3 Open questions

- [ ] <question and who can answer it>
- [ ] <question and who can answer it>

## 16. Definition of Done

### 16.1 Required for completion

- [ ] <required behavior implemented>
- [ ] <required tests/checks pass>
- [ ] <docs/plan files updated>
- [ ] <failure behavior validated or documented>
- [ ] <security/safety requirements satisfied>

### 16.2 Recommended follow-ups

- [ ] <non-blocking improvement>
- [ ] <non-blocking improvement>

## Appendix A. References

- `<path or URL>` — <why it matters>
- `<path or URL>` — <why it matters>

## Appendix B. Examples

```text
<example input/output, file format, log line, or user flow>
```
