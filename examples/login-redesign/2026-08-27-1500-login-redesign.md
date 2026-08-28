---
created: 2026-08-27 15:00 +08:00
updated: 2026-08-27 16:10 +08:00
tags: [feature, bug-fix]
status: active
thread: login-redesign
prev: null
head: true
next: wire refresh into background token watcher
---

# Context Checkpoint: Login redesign

## feature

### Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R1 | Session survives expiry gracefully via silent refresh | solved | `npm test -- auth` green (14 cases) |
| R2 | Refresh endpoint wired into request pipeline | solved | e2e `login-refresh.spec.ts` passes locally |

### Decision

Expired sessions hard-logged users out mid-task and the token
refresh endpoint existed but was never wired, so long editing sessions lost
unsaved work. Introduce a shared auth interceptor (`src/auth/interceptor.ts`)
that catches 401, rotates the token once, and replays the original request.

### Consequences

Fewer forced logouts and no data loss on expiry; accepted
cost is one extra round-trip per expired token plus slight interceptor
complexity that every future client change must preserve.

### Verification

passed — `npm test -- auth` (unit) and
`npx playwright test login-refresh` (e2e), both run locally against the dev
server.

## bug-fix

### Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R3 | Audit log masks token values on retry | unresolved | interceptor logs raw header in debug mode |

### Decision

Token masking before any logging folds into the same
interceptor rather than a separate fix — one guard at the shared choke point.

### Verification

Not run — interceptor still logs the raw header in debug
mode (see R3).

## Update Log

- 2026-08-27 15:00: created checkpoint.
- 2026-08-27 16:10: appended R2 evidence + added R3 after first append-compaction.
- 2026-08-27: format migration to the type-section outline (type-outline spec); content preserved.
