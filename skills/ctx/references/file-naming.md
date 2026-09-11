# File Naming & Bilingual Triplet Contract

Source of truth: `docs/ctx-understanding.md` §5 and §10.
`scripts/doctor.mjs` validates naming, `.i18n.yaml` freshness, and the
language contract.

## Checkpoint naming

```text
YYYY-MM-DD-HHMM-<kebab-slug>.md
```

Example:

```text
2026-08-26-2115-login-session-fix.md
```

Responsibilities of the timestamp prefix:

- records creation time and keeps same-day ordering unambiguous;
- makes lexicographic order ≈ chronological order;
- avoids pure-date collisions when one day carries several compressions.

If two checkpoints fall in the same minute, resolve deterministically with ordinal suffixes `-02`, `-03`, … applied in creation order:

```text
2026-08-26-2115-login-session-fix.md
2026-08-26-2115-login-session-fix-02.md
```

Slug rules:

- lowercase kebab-case only (`[a-z0-9-]`);
- names the theme of the compression, readable at a glance;
- stable afterwards — renaming breaks prev links and index rows, so it MUST NOT happen.

## Bilingual triplet

Every canonical checkpoint ships as exactly three files sharing one `<base>`:

```text
2026-08-26-2115-login-session-fix.md          # English canon — what agents read by default
2026-08-26-2115-login-session-fix.zh.md       # Chinese mirror — structural twin, human reading
2026-08-26-2115-login-session-fix.i18n.yaml   # pairing credential
```

Language contract (mechanically enforced; full rule text in
`checkpoint-format.md` → Language contract):

- the canon is English only — zero CJK/fullwidth characters outside code
  spans, `next:` included; Chinese source text goes into backticks;
- the mirror is Chinese and a structural twin — same front matter keys
  (only `next` is translated), H1 plus the `（中文镜像）` suffix, identical
  `##`/`###` heading sequence, identical Requirements table IDs; its CJK
  characters MUST cover at least 30% of its letters;
- compose the canon in English first, then derive the mirror from the
  finished canon — never the other way around.

`.i18n.yaml` schema:

```yaml
en_blob: <sha1 git blob hash of the canon .md>
zh_blob: <sha1 git blob hash of the .zh.md>
synced_at: 2026-08-27 09:41
```

Rules:

1. The canon is authoritative; the mirror must always carry equivalent content.
2. The mirror never appears as a separate row in any index; indexes link only to the canon.
3. `prev:` chains and all cross-links point at canon paths, never mirrors.
4. After editing either side: sync the other side FIRST, then recompute both blob hashes and rewrite `.i18n.yaml`. An edited side behind a synced hash means the record is stale and doctor will flag it.
