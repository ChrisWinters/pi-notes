# tkt-003 evidence — Add measured coverage and resolve complexity gaps

Status: complete

## Tooling

- Installed dev-only `@vitest/coverage-v8` 4.1.10 with npm; `package-lock.json` records the provider and transitive dev packages.
- `test:coverage` runs `vitest run --coverage --coverage.reporter=text-summary --coverage.reporter=json`.
- `npm run test:coverage` — PASS: 13 files, baseline 132 tests and final 137 tests; final overall statements 87.75%, branches 78.83%, functions 95.32%, lines 88.04%.
- `coverage/coverage-final.json` exists, is matched by `.gitignore`, and is accepted by Fallow.

## Baseline measured evidence

- `src/cli.ts`: statements 43/59 (72.88%), branches 41/52 (78.85%), functions 5/9 (55.56%). `parseCliFlags` executed 25 times.
- `src/commands/notes.ts`: statements 17/22 (77.27%), branches 13/16 (81.25%), functions 4/4 (100%). `handleParsedNotesCommand` executed 117 times.
- Measured Fallow: 43 files, 496 functions, 0 above thresholds, 0 moderate/high/critical findings. Both static estimated-CRAP candidates cleared immediately under measured coverage.

## Gap inspection and targeted tests

- CLI uncovered locations were lines 70-81, 87-88, 101, 116, 121, 125-133, and 142-144: interactive prompt/readline, default process writers/cwd, non-force confirmation fallbacks, and direct executable entry. Edge flags, help precedence, literal interior tokens, forced deletion, and direct-entry detection were already exercised; no production refactor was warranted.
- Command-router baseline gaps included empty/usage, unknown-command, optional context construction, and unexpected-error rethrow paths.
- Added public tests for empty argv, explicit `help`, `commands`, unknown CLI command, and unexpected handler error propagation.
- Final `src/commands/notes.ts`: statements 20/22 (90.91%), branches 15/16 (93.75%), functions 4/4 (100%). Remaining line 23 usage guard is not reached through public parsers, which normalize empty input to a help route.
- Final `src/cli.ts` file metrics remained 72.88% statements, 78.85% branches, 55.56% functions; relevant parser behavior was already covered and measured Fallow remained clean.

## Final disposition and package proof

- Final measured Fallow: 43 files, 500 functions, 0 functions above thresholds and 0 moderate/high/critical findings.
- `npm run test -- tests/cli.test.ts tests/commands.test.ts` — PASS, 48 tests.
- `npm run lint` and `npm run typecheck` — PASS.
- `npm pack --dry-run --json --ignore-scripts` — PASS, 149 files and no `coverage/` entries.
- `git check-ignore -v coverage/coverage-final.json` confirms `.gitignore:3`; generated coverage is absent from Git status.

## Commit

Recorded by the repository commit with subject `test(coverage): add measured complexity evidence`.
