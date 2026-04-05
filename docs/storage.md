# Storage (Draft)

Default note locations:

- Project: `.pi/notes/`
- Global: `~/.pi/notes/`

Resolution behavior:

1. Default: project first, then global fallback
2. `--project`: project only
3. `--global`: global only

Format:

- Markdown files with lightweight frontmatter
- Safe slug-based filename normalization

Detailed invariants will be finalized in T-002 and T-003.
