# T-007 Docs Consistency Checklist

Date: 2026-04-05
Ticket: `T-007 — Documentation completion and consistency pass`

## Files updated

- `README.md`
- `docs/architecture.md`
- `docs/commands.md`
- `docs/storage.md`
- `docs/security.md`
- `docs/release.md`

## Consistency checks

| Check | Status |
|---|---|
| Command reference matches implemented subcommands | ✅ |
| Scope rules (`--project`, `--global`, default fallback) documented | ✅ |
| `grep` UX states (hit/no-hit/invalid query) documented | ✅ |
| `rm` confirm behavior documented | ✅ |
| `rewrite` preview + confirm behavior documented | ✅ |
| Non-interactive guard (`ctx.hasUI`) documented | ✅ |
| Pi command collision suffix note (`/notes:1`) documented | ✅ |
| Pi reference snapshot link included | ✅ |

## Notes

- Current `/notes rewrite <instruction>` behavior is documented accurately as editor-driven proposal + preview + confirm, with instruction retained as user intent metadata in command output.
