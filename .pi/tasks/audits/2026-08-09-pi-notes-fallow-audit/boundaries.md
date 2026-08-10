# Architecture Boundary Findings

## Finding: configured entry boundary contradicts the implemented extension adapter

**Affected paths**

- `.fallowrc.json`
- `src/index.ts:17`
- `src/index.ts:19`
- `src/core/mutation.ts`
- `src/core/output-artifact.ts`

**Fallow command**

```bash
npx fallow dead-code --boundary-violations --format json --quiet 2>/dev/null || true
```

**Observed output**

Fallow 3.14.0 reported two `boundary-violation` findings. The configured `entry` zone may import only `entry` and `commands`, but `src/index.ts` imports the mutation coordinator and output-artifact support from `core`. Boundary coverage itself reported no unmatched files.

**Impact**

The configured rule is at error severity, so a Fallow gate can fail on architecture that the project currently documents and intentionally implements. This reduces confidence in the boundary policy and can hide future violations among known noise.

**Verification notes**

- `docs/architecture.md` assigns Pi queue injection and bounded tool output to `src/index.ts`, with implementations in `src/core/mutation.ts` and `src/core/output-artifact.ts`.
- `docs/agent-docs.yaml` records the same relationships.
- These imports are therefore expected adapter dependencies, not independently verified architecture defects.
- The likely defect is stale or overly broad zone configuration: `entry` groups the package shim, extension adapter, and CLI even though their dependency needs differ.

**Recommended remediation**

Decide and encode the intended adapter policy. Prefer a narrow zone for `src/index.ts` that explicitly allows the required core services while retaining stricter rules for `extensions/**` and `src/cli.ts`; alternatively allow `entry -> core` if that broader dependency is intentional. Re-run the boundary command and require zero unexplained findings rather than suppressing the import lines.
