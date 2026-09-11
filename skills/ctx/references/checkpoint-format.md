# Checkpoint Format

Body skeleton and front matter schema for session checkpoints.
Source of truth: `.agents/specs/type-outline/` (body outline, tags derivation);
storage and naming rationale lives in `docs/ctx-understanding.md` §3–§5.
Aim for tens of lines per compression; omit empty sections and sub-fields;
never pad to fill the template.

## Front matter

Required YAML header of every canon checkpoint:

```yaml
---
created: 2026-08-27 09:41 +08:00
updated: 2026-08-27 14:02 +08:00
tags: []                       # derived from the body's type sections — never chosen independently
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
| tags | MUST equal the set of type sections present in the body; doctor enforces equality |
| status | state machine: active → superseded → archived |
| thread | groups a task's history across sessions |
| prev | previous head of the same thread, or null |
| head | true only while this doc is the thread's newest active record |

Controlled type vocabulary — one set doubles as the tag values and the body
section names:

| Tag / section | Meaning |
|---|---|
| feature | new user- or model-visible capability |
| bug-fix | defect, regression, or missing behavior fixed |
| architecture | code structure, data model, contract, invariant decisions |
| process | workflows, policies, tooling, maintenance rules |
| simplification | deliberate reduction of code, behavior, or surface complexity |
| testing | test infrastructure, strategy, verification design |

Canonical section order when several appear:
`architecture → process → feature → simplification → bug-fix → testing`.

Introducing a new value requires amending the type-outline spec first — do not
invent values ad hoc.

## Language contract

Every checkpoint is a bilingual pair: the canon (`<base>.md`) is English
only, the mirror (`<base>.zh.md`) is Chinese. The canon is what agents read;
the mirror is a structural twin for human reading. `doctor.mjs` enforces the
whole contract through the `canon-language`, `mirror-language`, and
`mirror-structure` categories.

Canon rules:

1. The canon — front matter included — MUST hold zero CJK or fullwidth
   characters outside code: U+2E80–2EFF, U+3000–303F, U+3040–U+30FF,
   U+3400–U+4DBF, U+4E00–U+9FFF, U+F900–U+FAFF, U+FE30–U+FE4F,
   U+FF00–U+FFEF.
2. WHEN the session quotes Chinese source text, UI copy, or user wording,
   the canon MUST carry it in an inline code span or a fenced block — never
   as prose. The same exemption covers paths, commands, and literal strings.
3. `next:` and every other natural-language front matter value is English,
   like the rest of the canon.

Mirror rules:

4. After the same code exemption, CJK characters MUST make up at least 30%
   of the mirror's letters: `CJK / (CJK + Latin letters)`. A mirror that
   merely copies the canon fails this.
5. The mirror MUST be a structural twin of the canon:
   - front matter holds the same keys, and every value matches except
     `next`, which is translated;
   - the H1 title is the canon title plus the suffix `（中文镜像）`;
   - the `##` and `###` heading sequence is identical — type sections and
     sub-fields stay English verbatim;
   - the Requirements table ID sequence is identical.
6. Structural keywords — type-section names, sub-field names, status enum
   values, front matter keys — are English in both files, never translated.

Composing rule: write the canon in English first, then derive the mirror
from the finished canon. Never draft in Chinese and translate only the
headings — that is the fake-English failure this contract exists to prevent.

## Body skeleton

The outline is the work-type taxonomy. The analytical questions — what was
required, what was decided, what followed, how it was verified — are sub-fields
inside each type section, never top-level headings.

```markdown
# Context Checkpoint: <title>

## architecture

### Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|

### Decision

What was decided, why, and which files/behaviors changed
(list key paths inline; no Created/Modified sub-inventories).

### Consequences

Benefits, costs, trade-offs — a few lines.

### Verification

How it was verified and the result.

## process

… (only sections with content appear, in canonical order)

## Update Log

- 2026-08-27 14:02: appended <what changed>.
```

Structure rules:

1. `##` headings are ONLY type sections (lowercase, verbatim from the
   vocabulary above) and `## Update Log`. Legacy analysis headings —
   `Problem` / `Requirements` / `Decision` / `Consequences` / `Verification`
   as `##` headings — are contract violations.
2. Inside a type section exactly four sub-field headings exist — `### Requirements`
   (table), `### Decision`, `### Consequences`, `### Verification` — and `###` is
   never used for anything else. Omit empty sub-fields; omit a type section
   entirely when it has no content.
3. Requirements IDs stay global across the document (spec clause references
   remain stable); rows live in the table of the section they belong to.
4. `## Update Log` is global — the cross-type timeline of the checkpoint.
5. A pure orientation session may degenerate to title + Update Log with
   `tags: []`.

Writing rules:

1. Tens of lines per compression; no padded, information-free paragraphs.
2. Key technical context folds into the `### Decision` sub-section of the
   relevant section when it genuinely aids understanding.
3. Changes fold into `### Decision` as inline path lists.

### Requirement statuses

Each requirement row carries exactly one status:

- `solved` — done, backed by evidence;
- `partial` — important parts still open;
- `unresolved` — not addressed yet;
- `deferred` — explicitly postponed;
- `rejected` — considered and declined, reason recorded.

Never mark work solved merely because a plan was written down.

### Spec-linked sessions

When the project tracks module specs under `.agents/specs/`, the
`### Requirements` table of the relevant type section references those
canonical clauses instead of redefining them:

1. `ID` cites the spec clause (e.g. `type-outline 3.4`); do not paraphrase
   or restate the requirement text — link to it.
2. `Evidence` points into the repo: paths under `.agents/specs/`, code paths,
   or command output.
3. Statuses still use the honest vocabulary above and must agree with the
   module's task checkboxes in `.agents/specs/index.md`: mark `solved` only
   when the implementing tasks are checked there.
4. Checkpoints record session deltas; they never override spec state. When
   scope or status legitimately changes, update the spec documents themselves.

Without a specs directory, define lightweight session-local requirement rows
as usual — nothing else changes.

### Verification honesty

In the `### Verification` sub-section:

- `passed` / `failed` only with real command output or review evidence;
- otherwise write `Not run`;
- "should work" is never a verified result.
