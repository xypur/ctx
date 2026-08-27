---
name: ctx
description: >-
  Save / restore compressed session context as decision-oriented project
  memory under .agents/context/. Use when the user asks to save context,
  compact a conversation into durable memory ("save this", "存一下上下文"),
  resume prior work from cache (恢复上下文), or maintain the checkpoint
  index; NOT for plain git commits or task notes.
---

# ctx — session context compression & cache

Turn conversation-heavy work into short decision checkpoints that any future
agent can read without replaying history. One compression = one session
checkpoint file pair of edits: canon + mirror.

Authoritative references (read on demand):

- `references/cache-layout.md` — directory shape and index formats
- `references/file-naming.md` — naming, triplets, `.i18n.yaml`
- `references/checkpoint-format.md` — front matter schema and body skeleton

## Operation map

| Operation | Means | Use when |
|---|---|---|
| `ctx` | show cache status + root index digest | orienting, or before create/append |
| `ctx-create` | open a NEW session checkpoint triplet | first compaction of a session |
| `ctx-append` | merge MORE content into the current session checkpoint | subsequent compactions of the same session |
| `ctx-resume` | restore prior work via progressive disclosure | starting work that history may affect |
| `ctx-archive` | move superseded records into archive/ | housekeeping after supersession |

## Standing rules

1. **Ask when ambiguous.** If the user's save request does not make clear
   whether to start a new checkpoint or continue the existing one, ask
   "create 还是 append？" — never pick silently.
2. **History is never erased.** Superseding marks `status: superseded`;
   archiving moves files; nothing is deleted. Updates go through
   `Update Log`, not overwrites.
3. **Honesty.** Requirement rows carry real statuses
   (`solved/partial/unresolved/deferred/rejected`); verification reports
   `passed/failed/Not run` only.
4. English canon first; sync the Chinese mirror + `.i18n.yaml` before
   declaring an operation done.
5. Never create classification directories or extra indexes — tags live in
   front matter only.

## ctx-create

1. Read root `index.md`; determine target: new `thread` slug (kebab-case)
   or an existing thread being superseded.
2. Choose initial `tags` (controlled vocab). A mixed feature+bug-fix session
   simply gets both tags in ONE checkpoint.
3. Name files per `file-naming.md`; if a name collides within the same
   minute, use the next `-NN` ordinal.
4. Write canon per `checkpoint-format.md`; set
   `created=updated=now`, `prev` = previous head path or null, `head: true`,
   `status: active`.
5. Translate to `<base>.zh.md`, compute both blob hashes,
   write `<base>.i18n.yaml`.
6. Root index: add Records line + thread row (superseded old head loses its
   row), set this doc as the head.
7. Only AFTER step 4–6 fully preserve the old record's still-valid facts,
   flip the previous head's `status` to `superseded`.

If the current minute already holds this slug, prefer appending distinctive
words over jumping to `-02` immediately.

## ctx-append

Locate head via root index Active Threads (if missing → report, suggest
`ctx`; do not silently create).

1. Keep filename, `created`, `thread` unchanged; refresh `updated`.
2. Merge increments structurally into whichever of Problem / Requirements /
   Decision / Consequences / Verification actually exist: new facts integrated
   in place, statuses moved forward with evidence, no copy-pasted second
   summary dumped at the end.
3. Append one timestamped line to `Update Log`.
4. Tags may gain values; never lose ones that still apply.
5. Sync mirror + rewrite `.i18n.yaml` hashes; update the root index record
   line if its digest changed.

## ctx-resume

Progressive disclosure — read as little as possible:

| Layer | Read | Rule |
|---|---|---|
| L1 | root `index.md` | always first |
| L2 | selected canon checkpoint(s) | only those relevant to the task at hand |
| L3 | `prev:` ancestors and/or `archive/index.md` | only when L2 lacks facts or evolution must be traced |

Mirrors are NOT read by default. Finish by reporting: restored position,
active thread state, and the `next:` action line.

## ctx-archive

Only for candidates whose `status` is `superseded` (or `archived`):

1. Move the full triplet into `archive/`.
2. Set `status: archived`, `head: false` (front matter edit inside the move).
3. Repair links atomically: drop root-index row; prepend archive-index entry;
   rewrite every `prev:` pointing at the moved canon to the new relative path.
4. Refuse if any ACTIVE record still references it via `prev:` without the
   supersession completed — finish supersession first, then retry.
