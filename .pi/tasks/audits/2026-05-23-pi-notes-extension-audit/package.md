# Package/install findings

## Finding: package runtime dependencies and import names do not match current Pi package docs

### Affected paths

- `package.json`
- `src/index.ts`
- `tests/tools.test.ts`

### Observed behavior

`package.json` declares Pi resources correctly, but its extension runtime imports use the older `@mariozechner/*` package family and `@sinclair/typebox`:

- `peerDependencies`: `@mariozechner/pi-coding-agent`
- `devDependencies`: `@mariozechner/pi-coding-agent`, `@sinclair/typebox`
- `src/index.ts`: imports `ExtensionAPI` from `@mariozechner/pi-coding-agent` and `Type` from `@sinclair/typebox`

The package manifest points Pi at source TypeScript:

```json
"pi": {
  "extensions": ["./src/index.ts"],
  "skills": ["./skills"]
}
```

Because the extension entry is `src/index.ts`, those imports must resolve at Pi package runtime.

### Expected Pi/documented behavior

Current Pi package docs (`/home/chris/.nvm/versions/node/v24.14.0/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md`) state:

- runtime dependencies belong in `dependencies`;
- Pi bundles core packages for extensions/skills;
- packages importing Pi core packages should list them in `peerDependencies` with `"*"` and not bundle them;
- current core package names are `@earendil-works/pi-ai`, `@earendil-works/pi-agent-core`, `@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`, and `typebox`.

Current extension docs (`docs/extensions.md`) examples import:

```ts
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
```

### Impact

On a current Pi install that follows the documented package environment, a published/installed `pi-notes` package may fail to load because the TypeScript extension imports older package names and `@sinclair/typebox`, while current docs identify `@earendil-works/*` and `typebox` as the bundled/peer import surface.

Even if local development works because dev dependencies are installed, package consumers can see discovery/load failures after `pi install npm:@tribalnerd/pi-notes`.

### Recommended remediation

- Migrate extension/test imports from `@mariozechner/pi-coding-agent` to `@earendil-works/pi-coding-agent`.
- Migrate schema imports from `@sinclair/typebox` to `typebox` if targeting current Pi docs.
- Update `peerDependencies` to include the documented current Pi peer packages used at runtime.
- Keep runtime-only third-party dependencies in `dependencies`; do not rely on `devDependencies` for installed package execution.
- Add a package-load smoke test that installs or loads the package in a production-like dependency layout.
