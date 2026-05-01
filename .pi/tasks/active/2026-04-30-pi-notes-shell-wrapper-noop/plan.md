# Plan: Confirm and fix `pi-notes` shell wrapper no-op

## Status

Planning only. No spec files created yet.

## Problem statement

The `pi-notes` executable resolves in this environment but appears to be a no-op when invoked directly:

- `pi-notes new tinker-skill --project ...` reportedly exited with status 0, produced no output, and created no note.
- `pi-notes ls --project`, `pi-notes --help`, and similar wrapper invocations reportedly produced no output.
- Calling the underlying package CLI with Node worked:
  - `node .../@tribalnerd/pi-notes/dist/src/cli.js new tinker-skill --project`
  - `node .../@tribalnerd/pi-notes/dist/src/cli.js append tinker-skill ... --project`

The suspected issue: `/home/chris/.nvm/versions/node/v24.14.0/bin/pi-notes` resolves to the package CLI, but direct execution exits successfully without running the CLI behavior.

## Initial confirmation performed

From `/home/chris/Projects/pi-notes`:

```bash
command -v pi-notes
# /home/chris/.nvm/versions/node/v24.14.0/bin/pi-notes

pi-notes --help
# status: 0
# stdout bytes: 0
# stderr bytes: 0

node /home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js --help
# status: 0
# stdout bytes: 661
# stderr bytes: 0
# output begins with Usage:
```

Wrapper resolution:

```bash
ls -l /home/chris/.nvm/versions/node/v24.14.0/bin/pi-notes
# pi-notes -> ../lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js

readlink -f /home/chris/.nvm/versions/node/v24.14.0/bin/pi-notes
# /home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js
```

## Working hypothesis

The CLI module is importable/executable through `node <cli.js>`, but its direct executable path is not triggering the command runner. Likely causes to investigate:

1. Entry-point guard detects direct execution incorrectly for symlinked npm bin paths.
2. ESM `import.meta.url` / `process.argv[1]` comparison fails when launched through the symlink.
3. Built `dist/src/cli.js` has a shebang and executable target, but the direct-run detection path exits without dispatching.
4. Published package bin target is correct, but runtime path normalization is missing.

## Investigation plan

1. Inspect `src/cli.ts` and `dist/src/cli.js` entry-point logic.
2. Compare `process.argv`, `import.meta.url`, and resolved realpaths for both invocation modes:
   - `pi-notes --help`
   - `node dist/src/cli.js --help`
   - `node /home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js --help`
3. Identify whether the command runner is gated by a brittle direct-execution check.
4. Update source to handle symlinked npm bin execution reliably.
5. Rebuild package output.
6. Add regression coverage for direct CLI invocation semantics if practical.
7. Verify wrapper commands produce expected output and mutate notes only when intended.

## Candidate fix direction

If the issue is direct-execution detection, replace brittle string comparison with normalized realpath checks, or run the CLI unconditionally from the bin entry module and keep command parsing side-effect-safe for imports elsewhere.

## Validation checklist

Run from this repository and/or the installed package context:

```bash
npm test
npm run build
pi-notes --help
pi-notes ls --project
node dist/src/cli.js --help
```

Expected outcomes:

- `pi-notes --help` prints usage text and exits 0.
- `pi-notes ls --project` prints note listing or an expected empty-state message.
- Direct `node dist/src/cli.js --help` still works.
- No duplicate command execution occurs when importing CLI helpers in tests.

## Deliverables for a future spec

- `spec.md` with confirmed root cause, implementation approach, affected files, and risks.
- `prd.md`, `stories.md`, and `tickets.md` only after the user asks to proceed beyond this planning file.
