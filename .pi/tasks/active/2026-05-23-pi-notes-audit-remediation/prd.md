# PRD: pi-notes audit remediation

## Problem

The pi-notes extension has drifted from the current documented Pi package/tool contract. Audit findings identified package import mismatches, tool errors that do not set Pi tool failure state, unbounded tool output, incomplete mutation serialization, and stale docs.

## Users

- Pi users installing or loading the `@tribalnerd/pi-notes` package.
- Agents using `notes_*` tools to read and mutate notes.
- Maintainers validating package behavior against current Pi docs.

## Requirements

1. The extension source entry declared in `package.json` must use Pi import/dependency names compatible with the current documented package surface.
2. Agent-facing note tools must throw on command-domain failures so Pi marks tool execution as failed.
3. Agent-facing note tools must truncate large output before returning it to the model.
4. Same-note mutations must be serialized consistently across append, write/new, move, rename, and delete flows where applicable.
5. Public docs must describe the current agent tool surface and fallback behavior without exposing hidden aliases.

## Non-requirements

- Publishing/release automation.
- New destructive agent tools.
- Changing note markdown defaults or hidden alias behavior.

## Success metrics

- Full validation scripts pass.
- Tests fail if tool errors resolve normally, large outputs are unbounded, or source extension imports cannot resolve.
- Docs clearly separate user commands from agent tools.
