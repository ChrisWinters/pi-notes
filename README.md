# pi-notes

`pi-notes` is a Pi extension for human-focused notes with deterministic command flows and explicit safety checks.

> Status: MVP in progress (`docs/plans/active/2026-04-05-pi-notes-mvp/`).

## Planned command surface

- `/notes ls`
- `/notes show <name>`
- `/notes new <name>`
- `/notes append <name> <text>`
- `/notes rm <name>`
- `/notes grep <query>`
- `/notes rewrite <name> <instruction>`

## Scope model

- Project notes: `.pi/notes/`
- Global notes: `~/.pi/notes/`
- Default read preference: project first, then global fallback

## Development

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

## Spec source

- Plan docs: `docs/plans/active/2026-04-05-pi-notes-mvp/`
- Pi reference snapshot: `docs/references/pi-extensions.md`
