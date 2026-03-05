## [ERR-20260305-001] npm_test

**Logged**: 2026-03-05T09:58:00Z
**Priority**: medium
**Status**: pending
**Area**: tests

### Summary
`npm test` failed because `npx` could not resolve `registry.npmjs.org` in this restricted environment.

### Error
```text
npm error code ENOTFOUND
npm error syscall getaddrinfo
npm error errno ENOTFOUND
npm error network request to https://registry.npmjs.org/tsx failed, reason: getaddrinfo ENOTFOUND registry.npmjs.org
```

### Context
- Command: `npm test`
- Script: `npx tsx test/test-e2e.ts`
- Environment: network-restricted sandbox without npm registry DNS access

### Suggested Fix
Pin `tsx` in project dependencies and run tests via the local binary to avoid `npx` registry fetches in offline environments.

### Metadata
- Reproducible: yes
- Related Files: package.json, test/test-e2e.ts

---
