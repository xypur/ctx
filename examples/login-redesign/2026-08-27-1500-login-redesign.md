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

## Problem

Expired sessions hard-logged users out mid-task, and the token refresh
endpoint existed but was never wired, so long editing sessions lost unsaved
work.

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R1 | Session survives expiry gracefully via silent refresh | solved | `npm test -- auth` green (14 cases) |
| R2 | Refresh endpoint wired into request pipeline | solved | e2e `login-refresh.spec.ts` passes locally |
| R3 | Audit log masks token values on retry | unresolved | interceptor logs raw header in debug mode |

## Decision

Introduce a shared auth interceptor (`src/auth/interceptor.ts`) that catches
401, rotates the token once, replays the original request, and masks token
values before any logging. Both the feature wiring (refresh) and the defect
fix (hard logout) land in this one checkpoint; tags carry both facets.

## Consequences

Fewer forced logouts and no data loss on expiry; accepted cost is one extra
round-trip per expired token plus slight interceptor complexity that every
future client change must preserve.

## Verification

passed — `npm test -- auth` (unit) and `npx playwright test login-refresh`
(e2e), both run locally against the dev server.

## Update Log

- 2026-08-27 15:00: created checkpoint.
- 2026-08-27 16:10: appended R2 evidence + added R3 after first append-compaction.
