# tkt-005 notes — Align package, CI, and release contracts

## Changes

- Declared `@earendil-works/pi-coding-agent` and `typebox` as `"*"` peers while retaining repository-tested versions in `devDependencies`.
- Removed the direct TypeBox runtime dependency and regenerated package-lock root metadata.
- Extended package-resource tests to verify peer/dev/lock consistency and inspect the real npm dry-run file manifest.
- Changed CI installation to `npm ci --no-audit --no-fund`.
- Replaced release-branch push publication with `release.published` and manual `workflow_dispatch` carrying a required existing tag.
- Restricted manual dispatch execution to `main`, checks out the selected release tag, and verifies strict tag/package-version agreement before installation or publication.
- Preserved `contents: read`, `id-token: write`, trusted publishing, and `npm publish --provenance`.
- Added static workflow contract tests and aligned the release guide with triggers, tag checks, and external protection requirements.

## Protected environment decision

No protected GitHub environment name is evidenced in repository configuration. In accordance with the spec, no name was invented. The release guide now requires external `main`/Actions dispatch protections and explains that maintainers must add the exact environment name to both workflow and npm Trusted Publisher configuration if they create one.

## Boundaries

- No publish, push, npm login, or external GitHub/npm configuration was performed.
- The manual route publishes an existing version tag rather than mutable branch contents.
