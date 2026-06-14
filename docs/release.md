# Release Guide

## Quality gate (required)

Run and pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Manual smoke test (required)

In Pi, validate:

- `/notes setup`
- `/notes show note --global`
- `/notes new smoke-note`
- `/notes edit smoke-note` (markdown formatting preserved)
- `/notes append smoke-note "hello"`
- `/notes show smoke-note`
- `/notes grep hello`
- `/notes move smoke-note --to-global --project`
- `/notes uninstall --project` (confirm flow)
- `/notes rm smoke-note --global` (confirm flow)
- `/notes rewrite smoke-note <instruction>` (preview + confirm/cancel behavior)

## Documentation gate (required)

Before release:

- README command reference matches implementation
- `docs/commands.md` and `docs/storage.md` match behavior
- security docs cover confirm-gated flows and non-interactive behavior
- parser semantics (`--` handling, edge-only scope flags, move-target flags) are documented
- concurrency guarantees (atomic create + serialized mutations/moves) are documented
- plan tickets and evidence are current

## Versioning

- bump `package.json` semver
- update `CHANGELOG.md`
- tag `vX.Y.Z`

## Publish

### Quick commands (after version bump)

If publishing locally, first confirm npm auth:

```bash
npm whoami || npm login
```

Then use one of these publish commands:

```bash
npm publish --access public
npm publish --provenance --access public
```

- first command: standard npm publish
- second command: publish with provenance attestation
- `npm login` is not needed every time; only when not already authenticated

### GitHub Actions (recommended, with provenance)

This repo includes `.github/workflows/publish.yml`, which publishes with:

```bash
npm publish --provenance
```

Trigger options:

- publish a GitHub Release (`release.published`)
- run workflow manually (`workflow_dispatch`)

One-time npm setup required:

1. In npm package settings for `@tribalnerd/pi-notes`, add a **Trusted Publisher**.
2. Provider: GitHub Actions
3. Repository: `ChrisWinters/pi-notes`
4. Workflow: `publish.yml`
5. Environment (if used): leave unset unless you later add one in workflow.

After trusted publishing is configured, the workflow publishes without an `NPM_TOKEN` secret and attaches provenance automatically.

### Local fallback

```bash
npm whoami || npm login
npm publish --access public
```

## Release readiness checklist

- [ ] quality gate passed (`lint`, `typecheck`, `test`, `build`)
- [ ] Pi smoke test evidence logged in plan evidence folder
- [ ] README and docs pages match command behavior
- [ ] parser regression tests pass (literal flag-token + `--` cases + move-target flag parsing)
- [ ] concurrency regression tests pass (atomic create + concurrent append/move)
- [ ] setup/idempotency tests pass (`/notes setup`, starter note preservation)
- [ ] changelog updated for release version
- [ ] npm metadata checked (`name`, `repository`, `homepage`, `license`)

## Post-publish checks

- verify npm package metadata
- validate install path in a clean Pi environment
- test command invocation with possible suffixed command names (`/notes:1`)
