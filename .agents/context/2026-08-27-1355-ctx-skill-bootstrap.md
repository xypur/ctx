---
created: 2026-08-27 13:55 +08:00
updated: 2026-08-27 13:55 +08:00
tags: [feature, process]
status: active
thread: ctx-skill
prev: null
head: true
next: use ctx-append on future compactions of this session; wire doctor into routine before commits
---

# Context Checkpoint: Bootstrap the ctx skill end to end

## Problem

Long sessions lost design decisions and unfinished threads between
compactions. The project needed a decision-oriented context cache so any
future agent could resume without replaying history — this session designed,
specified, implemented, and dogfooded that system.

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R1 | Revise design to session-scoped storage: flat `.agents/context/`, classification as front matter tags, six-section checkpoints, `ctx-create`/`ctx-append` naming | solved | docs/ctx-understanding.md §3–§15 revised at 8407708 |
| R2 | Create specs plans with requirement↔design↔task traceability | solved | .specs/ (cache-contract, operations, tooling), all statuses `implemented` in index.md |
| R3 | Implement the skill: five-operation SKILL.md + three contract references + zero-dependency init/doctor scripts | solved | skills/ctx/{SKILL.md,references/*,scripts/*.mjs} |
| R4 | Provide a Chinese mirror skill, files suffixed `.zh.md`, living under skills-zh/ | solved | skills-zh/ctx/SKILL.zh.md + references/*.zh.md |
| R5 | Doctor survives fault injection across every violation category | solved | 12/12 fixture cases pass (bad-tag, head-dup, prev-broken, status-enum, triplet-missing, naming, stray-dir, index-miss, i18n-stale→heal) |
| R6 | Full lifecycle walk-through: create → append → supersede → archive → doctor healthy | solved | /tmp walk fixture, doctor exit=0 after prev-link repair |
| R7 | Generated example caches demonstrating contract incl. mixed tags `[feature, bug-fix]` | solved | examples/{empty-skeleton,login-redesign,csv-import} all doctor-healthy |
| R8 | Skill lives at repo-root skills/ (not .agents/skills/), scripts untranslated, zh mirror naming consistent | solved | final layout per understanding §3 |

## Decision

1. Session = storage unit; one compression edits one checkpoint triplet.
   Mixed feature+bug-fix work shares one file via multi-value tags; task
   history crosses sessions through thread/prev/head chaining.
2. Operations named by filesystem semantics: `ctx-create` opens a new
   checkpoint triplet, `ctx-append` merges into the current head; ambiguous
   "save" requests must be asked, never guessed.
3. Checkpoint body trimmed from a 15-section template to six sections
   (Problem/Requirements/Decision/Consequences/Verification/Update Log);
   next-step moves into optional front matter `next:`.
4. Bilingual pairing uses git-blob-hash credentials recomputed in-memory
   (`lib.mjs#blobHash`, `sha1("blob <len>\0"+content)`); scripts stay in the
   English side only.
5. Skill ships at project root (`skills/ctx`, mirror `skills-zh/ctx`) and is
   imported into other repos wholesale; host adapters map slash commands but
   never copy the rules.
6. Two implement-time fixes recorded in tooling CHANGELOG: independent
   kebab-case regex for thread slug validation, and `--update-i18n` no longer
   counting healed sides as violations.

## Consequences

Benefits: retrieval is two hops maximum (index → checkpoint), small
compactions cost nothing extra, Chinese readers get an equivalent mirror,
and contract drift is mechanically detectable by doctor.

Costs/trade-offs: single-session files grow when one session spans many
topics (mitigated by append merging rather than splitting); tags offer weaker
semantic filtering than directories once volume grows; keeping en/zh mirrors
in sync is manual discipline enforced only by i18n-stale detection.

## Verification

passed — tooling fixture suite 12/12 (fault injection per violation category,
empty-scaffold healthy loop, update-i18n healing); lifecycle walk re-checked
with doctor exit=0; all three example dirs report healthy; commit 8407708
contains the full tree with clean status.

## Update Log

- 2026-08-27 13:55: created checkpoint (first real compaction of the bootstrap session).
