# Cache Layout & Index Contract

Normative reference for the shape of `.agents/context/` and its indexes.
Higher-level rationale lives in `docs/ctx-understanding.md` §4 and §6;
`scripts/doctor.mjs` enforces this contract mechanically.

## Layout

```text
.agents/context/
├── index.md                        # root index — the single navigation entry
├── YYYY-MM-DD-HHMM-<slug>.md       # session checkpoints, flat
├── YYYY-MM-DD-HHMM-<slug>.zh.md    # Chinese mirrors (companions)
├── YYYY-MM-DD-HHMM-<slug>.i18n.yaml
└── archive/
    ├── index.md                    # one-line entries of archived records
    └── <moved-in triplets>
```

Rules:

1. `archive/` is the only subdirectory that may exist under `.agents/context/`.
2. At the root level only `index.md`, flat checkpoint triplets, and `archive/` are allowed.
3. Classification directories such as `feature/` or `bug-fix/` MUST NOT be created; classification is expressed through the body's type sections (front-matter `tags` are derived from them; see `checkpoint-format.md`).
4. `.zh.md` and `.i18n.yaml` files are companions of their canon, never indexed as separate records.
5. Storing one checkpoint per session keeps "what happened in this session" answerable from a single file; cross-session history for the same task travels along `prev:` links.

## Root index (`index.md`)

The root index is a lightweight decision digest, not a directory dump. It has exactly three parts:

1. **Active Threads** — current thread table with head pointers;
2. **Records** — one summary line per active checkpoint document;
3. **Archive link** — pointer to the archive index.

Fresh scaffold rendered by `init.mjs`:

```markdown
# Context Index

AI-facing first entry to project memory. One summary line per active record:
type-prefixed digests + verification result.

## Active Threads

| Thread | Head | Updated |
|---|---|---|

## Records

## Archive

Superseded/archived records: [archive/index.md](archive/index.md)
```

Record line format (single line): one `<type>: <digest>` clause per type section
the checkpoint actually has, in canonical order, then a single Verification
clause:

```markdown
- [2026-08-26-2115-login-session-fix.md](2026-08-26-2115-login-session-fix.md) — architecture: <one line>; feature: <one line> · Verification: passed|failed|Not run
```

Thread row format:

```markdown
| login-session | 2026-08-26-2115-login-session-fix.md | 2026-08-27 09:41 |
```

Maintenance rules:

1. Every `status: active` document has exactly one Records line, and every Records line points to an existing active document.
2. A document whose status leaves `active`, or which was moved into `archive/`, loses its Records line immediately; the Active Threads row is updated or removed in the same edit.
3. Summaries stay compact (one line each). Full reasoning, complete file lists, and verification output live inside the checkpoints — the index only helps an agent decide which record to open.

## Archive index (`archive/index.md`)

Fresh scaffold:

```markdown
# Archive Index

One line per superseded/archived record, newest first.

- [2026-08-26-1801-old-thread.md](old-thread.md) — <title> · superseded by [2026-08-26-2115-login-session-fix.md](../2026-08-26-2115-login-session-fix.md) on 2026-08-26
```

Rules:

1. Entries are one-line digests (title + date + link + reason); no decision fields required here.
2. When `ctx-archive` moves a triplet, the archive index gains its entry at the top and all links elsewhere are repaired in the same operation (see SKILL.md → ctx-archive).
