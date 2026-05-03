# pi-notes CLI Shim Observation

## Status
- Observation captured for later research and correction.
- Date observed: 2026-04-24

## Summary
While using `pi-notes` from an agent shell, the globally installed `pi-notes` executable appeared to exit successfully without performing the expected project-note operation or printing diagnostic output. Running the same operation through the package's direct compiled CLI entrypoint worked as expected.

## Environment
- Working directory for the note operation: `/home/chris/Projects/tinker.net`
- Global executable resolved by shell:
  - `/home/chris/.nvm/versions/node/v24.14.0/bin/pi-notes`
- Direct package CLI entrypoint used successfully:
  - `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js`

## Reproduction notes
From `/home/chris/Projects/tinker.net`:

```bash
pi-notes ls --project
```

Observed:
- No output.

Then:

```bash
pi-notes new tinker-net-hero-image-prompt --project
echo exit:$?
find .pi -maxdepth 3 -type f | sort | grep notes || true
```

Observed:
- Exit code: `0`
- No visible `Created [project] ...` output.
- No project note file appeared under `.pi/notes/`.

Using the direct compiled CLI entrypoint:

```bash
node /home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js new tinker-net-hero-image-prompt --project
```

Observed:
- Printed: `Created [project] tinker-net-hero-image-prompt.md`
- Created `.pi/notes/tinker-net-hero-image-prompt.md` as expected.

A subsequent direct-entrypoint append also worked:

```bash
node /home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js append tinker-net-hero-image-prompt "..." --project
```

Observed:
- Printed: `Updated [project] tinker-net-hero-image-prompt.md`
- Updated the expected project note file.

## Initial hypothesis
The issue appears related to the globally installed `pi-notes` executable/shim behavior in this shell environment, not to the core storage implementation. The direct Node invocation of the compiled CLI uses the same package code path and works correctly.

Possible areas to inspect later:
- Whether the global `pi-notes` executable is a stale or mismatched copy.
- Whether the shim preserves `process.argv[1]`/module resolution as expected for ESM execution.
- Whether stdout/stderr or cwd differs when invoked through the global executable.
- Whether `pi-notes` has multiple installations on PATH or version drift between shim and package contents.
- Whether the global executable is being shadowed or modified by npm/nvm linking behavior.

## Suggested follow-up checks
```bash
command -v pi-notes
head -20 $(command -v pi-notes)
readlink -f $(command -v pi-notes)
node -v
npm list -g --depth=0 | grep pi-notes || true
pi-notes help
pi-notes new shim-test --project
node /home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js new direct-test --project
```

Compare:
- exit codes
- stdout/stderr
- created files
- cwd-dependent behavior
- installed package version and source file contents
