# T-002 Edge Case Matrix

Date: 2026-04-05
Ticket: `T-002 — Implement core naming and path safety module`

## Naming behavior matrix

| Input | Expected | Outcome |
|---|---|---|
| `Project Ideas` | `project-ideas.md` | ✅ |
| `Project Ideas.md` | `project-ideas.md` (single extension) | ✅ |
| `Café notes!!!` | `cafe-notes.md` | ✅ |
| `   ` | reject empty name | ✅ |
| `!!!` | reject invalid/empty slug result | ✅ |
| `../secrets` | reject traversal | ✅ |
| `a/b` | reject path separator | ✅ |
| `a\\b` | reject path separator | ✅ |
| `/etc/passwd` | reject absolute path | ✅ |
| `~/.ssh/config` | reject home-path style input | ✅ |
| long slug (>120 chars) | reject too long | ✅ |

## File-name safety matrix

| File name | Expected | Outcome |
|---|---|---|
| `project-ideas.md` | valid | ✅ |
| `Project Ideas.md` | reject non-normalized | ✅ |
| `project_ideas.md` | reject invalid separator | ✅ |
| `../project-ideas.md` | reject traversal | ✅ |
| `project-ideas.txt` | reject wrong extension | ✅ |

## Validation commands

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run test` ✅
- `npm run build` ✅
