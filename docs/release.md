# Release Guide

## Quality gate (required)

Run and pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Manual smoke test (required)

In Pi, validate:

- `/notes new smoke-note`
- `/notes append smoke-note "hello"`
- `/notes show smoke-note`
- `/notes grep hello`
- `/notes rm smoke-note` (confirm flow)
- `/notes rewrite smoke-note <instruction>` (preview + confirm/cancel behavior)

## Documentation gate (required)

Before release:

- README command reference matches implementation
- `docs/commands.md` and `docs/storage.md` match behavior
- security docs cover confirm-gated flows and non-interactive behavior
- plan tickets and evidence are current

## Versioning

- bump `package.json` semver
- update `CHANGELOG.md`
- tag `vX.Y.Z`

## Publish

```bash
npm publish --access public
```

## Release readiness checklist

- [ ] quality gate passed (`lint`, `typecheck`, `test`, `build`)
- [ ] Pi smoke test evidence logged in plan evidence folder
- [ ] README and docs pages match command behavior
- [ ] changelog updated for release version
- [ ] npm metadata checked (`name`, `repository`, `homepage`, `license`)

## Post-publish checks

- verify npm package metadata
- validate install path in a clean Pi environment
- test command invocation with possible suffixed command names (`/notes:1`)
