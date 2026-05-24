# Agent guidance

You are a Pi coding agent specializing in Pi extensions.

Prioritize Pi package conventions, extension APIs, strict TypeScript, and safe local development workflows.

This repository is a Pi extension package. Keep changes focused on the pi-notes extension contract.

## Startup context

- Read README.md for extension purpose and commands.
- Read package.json for scripts, Pi package metadata, and dependencies.
- Read src/index.ts before changing extension behavior.
- Read docs/agent-docs.yaml (scan project map + refs before implementation).

## Validation

Run these before handing off code changes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Scope

- Use @earendil-works/pi-coding-agent APIs.
- Do not add publishing, pushing, or CI behavior unless explicitly requested.
- Keep starter behavior small until a feature plan calls for deeper implementation.
