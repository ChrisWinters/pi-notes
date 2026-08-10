# Complexity Findings

## Finding: two moderate CRAP-score candidates use static estimated coverage

**Affected paths**

- `src/cli.ts:36` — `parseCliFlags`
- `src/commands/notes.ts:8` — `handleParsedNotesCommand`
- `src/core/storage.ts` — highest change/complexity hotspot, without a function-level threshold breach

**Fallow commands**

```bash
npx fallow health --complexity --hotspots --ownership --targets --format json --quiet 2>/dev/null || true
npx fallow health --complexity --complexity-breakdown --format json --quiet 2>/dev/null || true
```

**Observed output**

Fallow 3.14.0 analyzed 43 files and 495 functions. It reported two moderate findings and no high or critical findings:

- `parseCliFlags`: cyclomatic 12, cognitive 12, estimated CRAP 43.1.
- `handleParsedNotesCommand`: cyclomatic 10, cognitive 10, estimated CRAP 31.6.

The report labels both coverage tiers `partial` and uses static estimated coverage, not measured test coverage. Complexity contributions in `parseCliFlags` are concentrated in repeated edge-flag loops and boolean chains. Contributions in `handleParsedNotesCommand` come from usage/unknown-command branches, optional storage construction, and error handling.

Hotspot analysis ranked `src/core/storage.ts` first at 66.7 and `src/commands/notes.ts` second at 59.7 because of complexity combined with recent churn. The overall maintainability average was 91.6, p90 cyclomatic complexity was 3, and critical-complexity percentage was zero.

**Impact**

The two branching adapters are plausible regression points, while storage changes carry broad filesystem and safety impact. However, the CRAP scores may overstate test risk because no measured coverage input was supplied. Refactoring solely to satisfy the estimated score could add abstraction without reducing real risk.

**Verification notes**

- `tests/cli.test.ts` already exercises long/short/repeated help and confirmation flags, interior flag-like tokens, failure status, and direct-entry behavior.
- `tests/commands.test.ts`, `tests/tools.test.ts`, and `tests/modes.test.ts` exercise substantial command routing and outcome behavior.
- `tests/storage.test.ts` provides extensive storage-boundary coverage, so the hotspot recommendation should be interpreted as change-risk prioritization rather than missing-test proof.
- The per-decision breakdown confirms ordinary adapter branching; no single function exceeds the configured cyclomatic or cognitive thresholds. Both findings exceed only the CRAP threshold.

**Recommended remediation**

Collect measured coverage before scheduling a structural refactor. Use it to identify genuinely uncovered flag permutations and command error branches. If gaps remain, add targeted branch tests first; then consider table-driven CLI edge-flag consumption and a small storage/context factory for command routing. Keep storage decomposition separate and evidence-driven because its current safety windows and private helpers are tightly coupled to invariants.
