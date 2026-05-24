# tkt-001 Notes

Status: Done

## Changes

- Added `extensions/pi-notes/index.ts` as the unique Pi package extension entrypoint.
- Wrapper delegates to the existing implementation with `export { default } from "../../src/index.js";`.
- Updated `package.json` `pi.extensions` to `./extensions/pi-notes/index.ts`.
- Added `extensions` to `package.json` `files` so npm package contents include the wrapper.
- Updated `tsconfig.json` and `tsconfig.build.json` includes so `extensions/**/*.ts` is typechecked and built.

## Decisions

- Used the `.js` import specifier in the TypeScript wrapper because the project uses NodeNext ESM resolution and existing source imports use emitted `.js` specifiers.
