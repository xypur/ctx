# Examples

Generated samples demonstrating the ctx cache contract end to end.
All content is fictional; nothing here is a live record. Every directory
passes `node ../skills/ctx/scripts/doctor.mjs <dir>` with exit code 0 —
the i18n yaml hashes were computed from these very files via
`skills/ctx/scripts/lib.mjs#blobHash`.

| Directory | Shows |
|---|---|
| `empty-skeleton/` | what `init.mjs` scaffolds: root index + empty archive |
| `login-redesign/` | full triplet (en + zh mirror + real-hash i18n.yaml), mixed type sections (`feature` + `bug-fix`, tags derived), append already merged, Update Log trail, and an archive/index.md with a superseded-entry line |
| `csv-import/` | minimal single-section feature checkpoint, verification honestly `Not run` |

Read in this order: `empty-skeleton/index.md` → `login-redesign/index.md`
(L1) → `login-redesign/2026-08-27-1500-login-redesign.md` (L2) → its Update
Log shows what an append changed. The zh mirrors exist but are not part of
the default read path.

These directories are documentation, not live caches: they sit outside
`.agents/context/` so doctor runs against them explicitly by path.
