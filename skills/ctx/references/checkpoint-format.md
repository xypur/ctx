# Checkpoint Format

Body skeleton and front matter schema for session checkpoints.
Source of truth: `docs/ctx-understanding.md` §7–§8. Aim for tens of lines per compression; omit empty sections; never pad to fill the template.

## Front matter

Required YAML header of every canon checkpoint:

```yaml
---
created: 2026-08-27 09:41 +08:00
updated: 2026-08-27 14:02 +08:00
tags: []                       # subset of controlled vocab below; [] allowed
status: active                 # active | superseded | archived
thread: login-session          # stable kebab-case slug grouping related records
prev: null                     # previous head path (relative) or null
head: true
next: wire refresh redirect    # optional, one-line next action
---
```

Field rules:

| Field | Rule |
|---|---|
| created | set once by ctx-create, never changes (append keeps it) |
| updated | refreshed on every append |
| tags | values only from the controlled vocab; multiple allowed |
| status | state machine: active → superseded → archived |
| thread | groups a task's history across sessions |
| prev | previous head of the same thread, or null |
| head | true only while this doc is the thread's newest active record |

Controlled tag vocabulary:

| Tag | Meaning |
|---|---|
| feature | new user- or model-visible capability |
| bug-fix | defect, regression, or missing behavior fixed |
| architecture | code structure, data model, contract, invariant decisions |
| process | workflows, policies, tooling, maintenance rules |
| simplification | deliberate reduction of code, behavior, or surface complexity |
| testing | test infrastructure, strategy, verification design |

Introducing a new tag requires amending the cache-contract spec first — do not invent tags ad hoc.

## Body skeleton

```markdown
# Context Checkpoint: <title>

## Problem

The problem and goal in two or three sentences.

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|

## Decision

What was decided, why, and which files/behaviors changed
(list key paths inline; no Created/Modified sub-inventories).

## Consequences

Benefits, costs, trade-offs — a few lines.

## Verification

How it was verified and the result.

## Update Log

- 2026-08-27 14:02: appended <what changed>.
```

Writing rules:

1. Include a section only if it has content; empty sections are omitted entirely.
2. Key technical context goes inside Problem or Decision when it genuinely aids understanding; there is no standalone section for it.
3. Changes fold into Decision as inline path lists.

### Requirement statuses

Each requirement row carries exactly one status:

- `solved` — done, backed by evidence;
- `partial` — important parts still open;
- `unresolved` — not addressed yet;
- `deferred` — explicitly postponed;
- `rejected` — considered and declined, reason recorded.

Never mark work solved merely because a plan was written down.

### Verification honesty

- `passed` / `failed` only with real command output or review evidence;
- otherwise write `Not run`;
- "should work" is never a verified result.
