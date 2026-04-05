# Release Guide (Draft)

## Pre-release gate

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- manual smoke test in Pi

## Publish steps

1. Update `CHANGELOG.md`
2. Bump package version
3. Tag release (`vX.Y.Z`)
4. `npm publish --access public`

Detailed release checklist will be completed in T-008.
