# pi-notes Audit

- Date: 2026-04-05
- Scope: repository audit across requested categories
- Auditor: Pi agent

---

## 1) Security issue

### Summary
Initial review complete.

### Findings
- **No critical security vulnerability found** in current MVP command/storage flow.
- The code enforces note-name normalization and rejects traversal-style inputs before path construction.
- Confirm-gated destructive/mutating actions (`rm`, `rewrite`) are protected by `ctx.hasUI` checks.

### Notable risk (non-critical)
- **TOCTOU window in `createNote`** (`noteExists` check before write) could allow overwrite race in highly concurrent scenarios.

### Recommended follow-up
- Use exclusive file creation semantics (`open` with `wx`) to make note creation atomic.

---

## 2) Code quality

### Summary
Code quality check complete.

### Findings
- `npm run lint` passes with strict zero-warning policy.
- `npm run typecheck` passes under strict TypeScript settings.
- Module boundaries are clear (`commands`, `core`, `ui`, `types`).
- Tests are present for naming, storage, formatting, and command flows.

### Improvement opportunities
- `src/commands/notes.ts` is growing and now contains several responsibilities (arg parsing, routing, interaction flow). It is still readable, but should be split before additional features are added.

### Recommended follow-up
- Extract per-subcommand handlers (e.g., `commands/handlers/*.ts`) and a dedicated argument parser utility.

---

## 3) Bugs

### Summary
Bug review complete.

### Findings
- **Confirmed bug:** scope-flag parsing is global across all tokens. `--project` / `--global` are stripped even when they appear in user content (append text/query/instruction), not just as options.
- This can change command behavior unexpectedly (for example, `append` may switch scope instead of storing literal text containing `--global`).

### Repro note
- Created a temporary note, then ran append text containing `--global`; command attempted global scope resolution instead of preserving token as content.

### Recommended follow-up
- Parse flags only in a defined option position (e.g., prefix-only or suffix-only), or use `--` end-of-options semantics.
- Add regression tests for literal content containing `--project` and `--global`.

---

## 4) Race

### Summary
Concurrency/race review complete.

### Findings
- **Creation race risk (TOCTOU):** `createNote()` performs `noteExists()` then writes the file. Concurrent creators can race.
- **Append race risk (lost update):** `appendToNote()` uses read-modify-write without locking; concurrent appends can overwrite each other.

### Impact
- Low in typical single-user interactive workflows.
- Medium in automated or concurrent command execution contexts.

### Recommended follow-up
- Use atomic create (`open` with `wx`) for note creation.
- Introduce per-note mutation serialization (mutex/queue) for append/write paths.

---

## 5) Test flakiness

### Summary
Flakiness check complete.

### Findings
- Test suite passed repeatedly (5 consecutive runs).
- Tests use per-run temp directories and cleanup, reducing cross-test contamination.
- No dependency on external network/services.

### Risk level
- **Low** current flakiness risk.

### Recommended follow-up
- Keep file-system tests isolated per case (already done).
- Add targeted regression tests for known bug/race risks to prevent intermittent behavior from being reintroduced.

---

## 6) Maintainability of the code

### Summary
Maintainability review complete.

### Strengths
- Clear high-level module split (`commands`, `core`, `ui`, `types`).
- Strict lint/type standards are enforced in CI.
- Plan/ticket/evidence discipline is strong and improves long-term maintainability.

### Maintainability concerns
- `src/commands/notes.ts` is becoming a monolithic router with parsing, validation, flow control, and UI logic mixed together.
- Flag parsing behavior is implicit and currently error-prone (already causing a bug).
- Storage concerns (scope resolution, file ops, search, mutation) are all in one class and will continue growing.

### Recommended follow-up
1. Split command handlers by subcommand (`new/show/append/rm/grep/rewrite`).
2. Extract a dedicated CLI argument/options parser with explicit semantics.
3. Introduce a service layer for rewrite flow to separate UI from domain mutation logic.
4. Add race-safety primitives before adding more write-heavy features.

---

## Overall audit verdict

- **Current state:** solid MVP foundation with strong quality gates.
- **Priority fixes before wider release:**
  1. Fix flag parsing bug for literal `--project` / `--global` content.
  2. Add atomic create + serialized per-note mutation to reduce race risks.
