# Brainstorm: Unique extension entry path

## Original ask

User-provided brainstorm idea:

> I would like to make the following adjustment to pi-notes: Rename the extension entry path to something unique, without nesting the whole repo.
>
> For example:
>
> ```text
> pi-notes/
> src/
> ...implementation...
> extensions/
> pi-notes/
> index.ts
> ```
>
> Then extensions/pi-notes/index.ts can re-export/register from ../../src/index.ts, and package.json becomes:
>
> ```json
> "pi": {
>   "extensions": ["./extensions/pi-notes/index.ts"],
>   "skills": ["./skills"]
> }
> ```

## Rough task idea

Adjust the pi-notes Pi package so its declared extension entry uses a unique package-specific path under `extensions/pi-notes/index.ts` instead of pointing directly at `src/index.ts`.

The intended shape is:

- Keep implementation code in `src/`.
- Add a thin Pi extension entrypoint at `extensions/pi-notes/index.ts`.
- Have that entrypoint re-export or register the default extension from `../../src/index.ts`.
- Update `package.json` `pi.extensions` to reference `./extensions/pi-notes/index.ts`.
- Ensure the published package includes the new `extensions` directory.

## Current context

- `package.json` currently declares:
  - `pi.extensions: ["./src/index.ts"]`
  - `files: ["src", "dist", "skills", "README.md", "LICENSE"]`
- `src/index.ts` contains the actual `/notes` command and `notes_*` tool registration.
- Pi package docs allow extension paths in `package.json` under the `pi` key, with paths relative to package root.
- Pi extension docs show directory-based extension entries using `extensions/<name>/index.ts` for multi-file or package-style extensions.

## Desired outcome

A future implementation should make the package manifest load a unique extension entry path while avoiding a repo-wide nested copy. The new entrypoint should remain minimal and delegate to the existing `src/index.ts` implementation.

## Likely implementation notes

- Add `extensions/pi-notes/index.ts` with a simple default re-export such as:
  - `export { default } from "../../src/index.js";` if TypeScript/Node module resolution in this package requires extension-style emitted imports, or
  - `export { default } from "../../src/index.ts";` if Pi's jiti-based source loading accepts it in this context.
- Verify with the local TypeScript settings and build output before choosing the import specifier.
- Update `package.json`:
  - `pi.extensions` should become `["./extensions/pi-notes/index.ts"]`.
  - `files` likely needs to include `"extensions"` so npm packaging contains the new entrypoint.
- Consider whether README docs should mention the package entry shape only if existing docs reference the manifest path.

## Scope boundaries

- Do not move the main implementation out of `src/`.
- Do not nest/copy the whole repository under `extensions/`.
- Do not change `/notes` command behavior or note storage behavior.
- Do not add publishing, CI, or release automation changes.
