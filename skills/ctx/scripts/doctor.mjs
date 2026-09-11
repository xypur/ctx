#!/usr/bin/env node

import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TAGS,
  STATUSES,
  TYPE_ORDER,
  parseBody,
  baseNameOk,
  slugOf,
  blobHash,
  parseFrontMatter,
  parseSimpleYaml,
  isDir,
  isFile,
  readIfFile,
  join,
  stripCodeSpans,
  cjkCount,
  cjkRatio,
  collectHeadings,
  collectTableIds,
  MIRROR_CJK_MIN_RATIO,
  MIRROR_TITLE_SUFFIX,
} from './lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

let ctxRoot = '.agents/context';
let updateI18n = false;
for (const arg of process.argv.slice(2)) {
  if (arg === '--update-i18n') updateI18n = true;
  else ctxRoot = arg;
}

ctxRoot = resolve(ctxRoot);

if (!isDir(ctxRoot)) {
  console.error(`doctor: '${relative(process.cwd(), ctxRoot)}' is not a directory`);
  process.exit(2);
}

const rel = (p) => relative(process.cwd(), p);
const violations = [];
const notes = [];
function violation(category, file, detail) {
  violations.push({ category, file, detail });
  console.log(`violation: ${category} | ${file} | ${detail}`);
}

if (!isFile(join(ctxRoot, 'index.md')))
  violation('structure', rel(join(ctxRoot)), 'missing root index.md');
if (!isDir(join(ctxRoot, 'archive')))
  violation('structure', rel(join(ctxRoot)), 'missing archive/ subdirectory');
else if (!isFile(join(ctxRoot, 'archive', 'index.md')))
  violation('structure', rel(join(ctxRoot, 'archive')), 'missing archive/index.md');

let bases = [];
for (const entry of readdirSync(ctxRoot)) {
  const p = join(ctxRoot, entry);
  if (entry === 'index.md' || entry === 'archive') continue;
  if (isDir(p)) {
    violation('unexpected-entry', rel(p), 'unexpected directory besides archive/');
    continue;
  }
  if (!entry.endsWith('.md')) {
    const dot = entry.indexOf('.i18n.yaml');
    if (dot > -1) continue;
    notes.push(`ignored: ${rel(p)} (not part of any triplet)`);
    continue;
  }
  if (entry.endsWith('.zh.md')) continue;
  if (!baseNameOk(entry.replace(/\.md$/, ''))) {
    violation('naming', rel(p), `${entry} does not match YYYY-MM-DD-HHMM-<kebab-slug>[-NN].md`);
    continue;
  }
  bases.push(entry.replace(/\.md$/, ''));
}

bases.sort();

for (const base of bases) {
  const canonPath = join(ctxRoot, `${base}.md`);
  const canonRel = rel(canonPath);
  const canonical = readIfFile(canonPath) ?? '';

  for (const suffix of [`.zh.md`, `.i18n.yaml`]) {
    if (!isFile(join(ctxRoot, base + suffix)))
      violation('triplet-missing', canonRel, `missing companion ${base}${suffix}`);
  }

  const fm = parseFrontMatter(canonical);
  if (!fm || typeof fm.data !== 'object') {
    violation('schema', canonRel, 'missing or unparseable YAML front matter');
    continue;
  }
  const d = fm.data;
  for (const k of ['created', 'updated', 'tags', 'status', 'thread', 'prev', 'head']) {
    if (!(k in d)) violation('schema', canonRel, `front matter field '${k}' missing`);
  }

  if ('status' in d && !STATUSES.has(d.status))
    violation('status-enum', canonRel, `invalid status '${d.status}'`);

  if (Array.isArray(d.tags)) {
    for (const t of d.tags)
      if (!TAGS.has(t)) violation('tags-vocab', canonRel, `'${t}' is not a controlled tag`);
  } else if ('tags' in d && d.tags !== undefined) {
    violation('schema', canonRel, 'tags must be a YAML array');
  }

  // ---- Body outline rules (type-outline spec) ----
  const parsed = parseBody(canonical);
  for (const h of parsed.legacyHeadings)
    violation('legacy-skeleton', canonRel, `legacy heading '## ${h}' — the body must use type sections`);
  for (const h of parsed.unknownHeadings)
    violation('section-vocab', canonRel, `unknown '## ${h}' heading — only type sections and Update Log allowed`);
  for (const dup of parsed.duplicates)
    violation('section-vocab', canonRel, `duplicate type section '${dup}'`);
  const present = parsed.sections.map((s) => s.type);
  const orderIdx = present.map((t) => TYPE_ORDER.indexOf(t));
  for (let i = 1; i < orderIdx.length; i++) {
    if (orderIdx[i] < orderIdx[i - 1]) {
      violation('section-order', canonRel, `type sections out of canonical order: ${present.join(', ')}`);
      break;
    }
  }
  for (const s of parsed.sections) {
    if (s.empty)
      violation('subfield-invalid', canonRel, `type section '${s.type}' is empty — omit it entirely`);
    for (const bad of s.invalidSubfields ?? [])
      violation('subfield-invalid', canonRel, `'### ${bad}' is not a valid sub-field heading in '${s.type}'`);
  }
  if (Array.isArray(d.tags)) {
    const tagSet = new Set(d.tags);
    const sectSet = new Set(present);
    const missing = [...sectSet].filter((t) => !tagSet.has(t));
    const extra = [...tagSet].filter((t) => !sectSet.has(t));
    if (missing.length || extra.length)
      violation(
        'tags-section-mismatch',
        canonRel,
        `tags [${d.tags.join(', ')}] != type sections [${present.join(', ') || 'none'}]`,
      );
  }

  if ('thread' in d && typeof d.thread === 'string' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.thread))
    violation('schema', canonRel, `thread slug '${d.thread}' is not kebab-case`);

  if ('prev' in d && d.prev !== null && d.prev !== undefined) {
    const prevPath = resolve(ctxRoot, String(d.prev));
    if (!isFile(prevPath))
      violation('prev-broken', canonRel, `prev '${d.prev}' does not resolve to an existing file`);
  }

  // ---- Language contract (bilingual-gate spec) ----
  const zhPath = join(ctxRoot, `${base}.zh.md`);
  const zhText = readIfFile(zhPath);
  if (zhText !== null) {
    const zhRel = rel(zhPath);

    const canonCjk = cjkCount(stripCodeSpans(canonical));
    if (canonCjk > 0)
      violation(
        'canon-language',
        canonRel,
        `canon holds ${canonCjk} CJK/fullwidth char(s) outside code spans — write English; quote Chinese source text in backticks`,
      );

    const ratio = cjkRatio(stripCodeSpans(zhText));
    if (ratio < MIRROR_CJK_MIN_RATIO)
      violation(
        'mirror-language',
        zhRel,
        `mirror CJK ratio ${(ratio * 100).toFixed(1)}% < ${(MIRROR_CJK_MIN_RATIO * 100).toFixed(0)}% (CJK / (CJK + Latin letters); code spans excluded)`,
      );

    const zhFm = parseFrontMatter(zhText);
    if (!zhFm) {
      violation('mirror-structure', zhRel, 'mirror is missing its YAML front matter');
    } else {
      const enKeys = Object.keys(d).sort();
      const zhKeys = Object.keys(zhFm.data).sort();
      if (enKeys.join(',') !== zhKeys.join(','))
        violation(
          'mirror-structure',
          zhRel,
          `front matter keys [${zhKeys.join(', ')}] != canon [${enKeys.join(', ')}]`,
        );
      for (const k of enKeys) {
        if (k === 'next') continue;
        if (JSON.stringify(zhFm.data[k]) !== JSON.stringify(d[k]))
          violation('mirror-structure', zhRel, `front matter '${k}' differs from the canon`);
      }
    }

    const zhTitle = parseBody(zhText).title;
    const expectedTitle = parsed.title === null ? null : `${parsed.title}${MIRROR_TITLE_SUFFIX}`;
    if (expectedTitle !== null && zhTitle !== expectedTitle)
      violation('mirror-structure', zhRel, `H1 '${zhTitle ?? '(none)'}' != '${expectedTitle}'`);

    const enHeads = collectHeadings(canonical);
    const zhHeads = collectHeadings(zhText);
    if (enHeads.join('\n') !== zhHeads.join('\n')) {
      const n = Math.max(enHeads.length, zhHeads.length);
      let i = 0;
      while (i < n && enHeads[i] === zhHeads[i]) i++;
      violation(
        'mirror-structure',
        zhRel,
        `heading sequence differs at #${i + 1}: '${enHeads[i] ?? '(none)'}' vs '${zhHeads[i] ?? '(none)'}'`,
      );
    }

    const enIds = collectTableIds(canonical);
    const zhIds = collectTableIds(zhText);
    if (enIds.join(',') !== zhIds.join(',')) {
      const n = Math.max(enIds.length, zhIds.length);
      let i = 0;
      while (i < n && enIds[i] === zhIds[i]) i++;
      violation(
        'mirror-structure',
        zhRel,
        `Requirements table IDs differ at #${i + 1}: '${enIds[i] ?? '(none)'}' vs '${zhIds[i] ?? '(none)'}'`,
      );
    }
  }
}

const byThread = new Map();
for (const base of bases) {
  const fm = parseFrontMatter(readIfFile(join(ctxRoot, `${base}.md`)) ?? '');
  if (!fm?.data) continue;
  const { data } = fm;
  const k = `${data.thread}|${data.head}`;
  if (k.endsWith('|true')) {
    const list = byThread.get(data.thread) ?? [];
    list.push(base);
    byThread.set(data.thread, list);
  }
}
for (const [thread, list] of byThread)
  if (list.length > 1)
    violation(
      'head-dup',
      thread,
      `${list.length} documents claim head=true (${list.join(', ')})`,
    );

const rootIndex = readIfFile(join(ctxRoot, 'index.md')) ?? '';
const indexedBases = new Set();
for (const line of rootIndex.split(/\r?\n/)) {
  const m = /^-\s*\[[^\]]+\]\(([^)]+)\)/.exec(line.trim());
  if (!m || m[1].includes('archive/')) continue;
  const target = m[1].split('#')[0];
  if (!target.endsWith('.md')) continue;
  const base = target.replace(/\.md$/, '');
  indexedBases.add(base);
  if (!bases.includes(base))
    violation('index-coverage', rel(join(ctxRoot, 'index.md')), `row points to unknown/non-canon '${target}'`);
}

const activeBases = new Set();
for (const base of bases) {
  const fm = parseFrontMatter(readIfFile(join(ctxRoot, `${base}.md`)) ?? '');
  if (fm?.data?.status === 'active') activeBases.add(base);
}
for (const base of activeBases)
  if (!indexedBases.has(base))
    violation('index-coverage', base, 'active document lacks a root-index Records line');

let i18nChecked = 0;
for (const base of bases) {
  const ymlPath = join(ctxRoot, `${base}.i18n.yaml`);
  const yml = readIfFile(ymlPath);
  if (!yml) continue;
  const cred = parseSimpleYaml(yml);
  const en = blobHash(readIfFile(join(ctxRoot, `${base}.md`)) ?? '');
  const zh = blobHash(readIfFile(join(ctxRoot, `${base}.zh.md`)) ?? '');
  i18nChecked++;

  const computeSides = [
    ['en_blob', en],
    ['zh_blob', zh],
  ];
  const staleSides = [];
  for (const [key, actual] of computeSides) {
    if (!cred[key] || String(cred[key]) !== actual) staleSides.push(key);
  }

  if (updateI18n) {
    writeFileSync(
      ymlPath,
      `en_blob: ${en}\nzh_blob: ${zh}\nsynced_at: ${new Date()
        .toISOString()
        .slice(0, 16)
        .replace('T', ' ')}\n`,
    );
    console.log(
      `i18n updated: ${rel(ymlPath)}${
        staleSides.length ? ` (healed ${staleSides.join(', ')})` : ' (already synced)'
      }`,
    );
  } else {
    for (const key of staleSides)
      violation('i18n-stale', rel(ymlPath), `${key} out of sync with current content`);
    if (!staleSides.length) console.log(`i18n synced:  ${rel(ymlPath)} (en, zh)`);
  }
}

console.log('');
console.log(
  `checked ${bases.length} checkpoint(s), ${i18nChecked} i18n credential(s)` +
    (notes.length ? `, ${notes.length} ignored item(s)` : ''),
);
notes.forEach((n) => console.log(n));
if (violations.length === 0) {
  console.log('healthy');
  process.exit(0);
}
console.log(`${violations.length} violation(s) across ${new Set(violations.map((v) => v.category)).size} category(ies)`);
process.exit(1);
