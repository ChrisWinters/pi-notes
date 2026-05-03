# tkt-002 notes — Validate built CLI and wrapper behavior

## Scope

Build the package and validate the CLI entry behavior through built output and a symlink/global wrapper path.

## Implementation notes

- Ran `npm run build` to regenerate ignored `dist/` output from TypeScript sources.
- Verified `node dist/src/cli.js --help` exits 0, writes usage text to stdout, and writes no stderr.
- Verified a local npm-bin-equivalent symlink to `dist/src/cli.js` exits 0, writes usage text to stdout, and writes no stderr after applying an executable bit to the generated local build artifact. This mirrors npm's bin linking behavior without publishing or changing the user's global install.
- Observed the currently installed global `pi-notes` still resolves to `/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@tribalnerd/pi-notes/dist/src/cli.js` and still no-ops; it was not used as pass/fail evidence because this slice does not publish or relink the package.
- No README or public CLI contract changes were needed; the existing documented `pi-notes <command>` and `node dist/src/cli.js` flows are preserved.
