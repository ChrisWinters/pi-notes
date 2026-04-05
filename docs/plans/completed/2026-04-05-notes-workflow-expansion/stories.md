# Stories: Notes Workflow Expansion

## Story 1 — Bootstrap and discoverability

**Outcome:** users can initialize notes intentionally and discover commands quickly.

### Includes
- `/notes setup`
- starter global `note.md` content
- `/notes help` and `/notes commands` aliases
- explicit post-setup guidance message

### Done when
- setup is idempotent
- setup reports created/existing assets clearly
- user sees guidance: `Run /notes show note --global`

---

## Story 2 — Markdown-friendly authoring/editing

**Outcome:** users can author and edit rich markdown without argument-parser loss.

### Includes
- `/notes edit <name> [--project|--global]`
- editor-driven write flow with cancel safety
- optional `/notes new <name> --edit`

### Done when
- spacing/newlines/paragraphs are preserved exactly
- cancel path produces no mutation

---

## Story 3 — Scope lifecycle operations

**Outcome:** users can intentionally reorganize and clean up notes storage.

### Includes
- `/notes move <name> --to-global|--to-project`
- deterministic collision handling (`--overwrite` explicit opt-in)
- `/notes uninstall [--project] [--global]` safe default + confirm gate

### Done when
- move preserves content and ends with one canonical destination
- uninstall requires explicit confirmation and refuses in no-UI mode

---

## Story 4 — Documentation and regression safety

**Outcome:** command contract is documented and protected by tests.

### Includes
- docs updates across README + docs pages
- parser/behavior tests for setup/help/move/uninstall/edit
- release checklist updates for new smoke checks

### Done when
- docs match implementation
- quality gate passes with new regressions covered
