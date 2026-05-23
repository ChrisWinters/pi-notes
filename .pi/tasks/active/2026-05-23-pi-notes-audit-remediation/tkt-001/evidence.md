# tkt-001 Evidence

Commands run:

```bash
npm view @earendil-works/pi-coding-agent version
# 0.75.5
npm view typebox version
# 1.1.38

npm install -D @earendil-works/pi-coding-agent@* typebox@^1.1.38
npm install

npm run typecheck
# passed

npm run test -- tests/package-resources.test.ts tests/tools.test.ts
# passed: 2 test files, 10 tests
```

Notes:

- `npm uninstall @mariozechner/pi-coding-agent @sinclair/typebox --save-dev` failed with an npm internal `ERR_INVALID_ARG_TYPE`; dependencies were removed from `package.json` and lockfile was reconciled by `npm install`.
