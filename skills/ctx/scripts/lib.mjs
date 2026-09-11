#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import { join } from 'node:path';

export const TAGS = new Set([
  'feature',
  'bug-fix',
  'architecture',
  'process',
  'simplification',
  'testing',
]);

export const STATUSES = new Set(['active', 'superseded', 'archived']);

const NAME_RE =
  /^(\d{4}-\d{2}-\d{2}-\d{4})-([a-z0-9]+(?:-[a-z0-9]+)*)(?:-(\d{2}))?$/;

export function baseNameOk(base) {
  return NAME_RE.test(base);
}

export function slugOf(base) {
  return NAME_RE.exec(base)?.[2];
}

export function blobHash(content) {
  const bytes = Buffer.byteLength(content, 'utf8');
  const h = createHash('sha1');
  h.update(`blob ${bytes}\0`);
  h.update(content);
  return h.digest('hex');
}

function coerce(v) {
  v = v.trim();
  if (/^\[.*\]$/.test(v)) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map((s) => s.trim()) : [];
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~' || v === '') return null;
  return v;
}

export function parseFrontMatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx <= 0) return null;
    data[line.slice(0, idx).trim()] = coerce(line.slice(idx + 1));
  }
  return { data, body: text.slice(m[0].length) };
}

export function parseSimpleYaml(text) {
  const data = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    data[line.slice(0, idx).trim()] = coerce(line.slice(idx + 1));
  }
  return data;
}

export function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

export function readIfFile(p) {
  try {
    return readFileSyncUtf8(p);
  } catch {
    return null;
  }
}

import { readFileSync } from 'node:fs';

function readFileSyncUtf8(p) {
  return readFileSync(p, 'utf8');
}

export { join };

// ---- Body outline parsing (type sections; see .agents/specs/type-outline) ----

export const TYPE_ORDER = [
  'architecture',
  'process',
  'feature',
  'simplification',
  'bug-fix',
  'testing',
];
export const TYPE_SET = new Set(TYPE_ORDER);
export const SUBFIELD_LABELS = new Set(['Requirements', 'Decision', 'Consequences', 'Verification']);
const LEGACY_HEADINGS = new Set(['Problem', 'Requirements', 'Decision', 'Consequences', 'Verification']);
/**
 * Parse a checkpoint's body (front matter stripped by the caller if desired —
 * this function tolerates its presence). Returns the h1 title, the type
 * sections in order of appearance (with their h3 sub-field headings and
 * emptiness), any legacy/unknown h2 headings, and whether an Update Log
 * section exists.
 */
export function parseBody(text) {
  const body = String(text).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const title = (/^# (?!#)[ \t]*(.+)[ \t]*$/m.exec(body) || [])[1] ?? null;
  const sections = [];
  const legacyHeadings = [];
  const unknownHeadings = [];
  const duplicates = [];
  let current = null;
  let updateLog = false;

  for (const line of body.split(/\r?\n/)) {
    const h2 = /^##\s+(.*?)\s*$/.exec(line);
    if (h2) {
      const name = h2[1];
      if (name === 'Update Log') { current = null; updateLog = true; continue; }
      if (TYPE_SET.has(name)) {
        if (sections.some((s) => s.type === name)) duplicates.push(name);
        current = { type: name, subfields: [], empty: true };
        sections.push(current);
        continue;
      }
      current = null;
      if (LEGACY_HEADINGS.has(name)) legacyHeadings.push(name);
      else unknownHeadings.push(name);
      continue;
    }
    if (!current) continue;
    const trimmed = line.trim();
    const h3 = /^###\s+(.*?)\s*$/.exec(line);
    if (h3) {
      const name = h3[1];
      if (SUBFIELD_LABELS.has(name)) {
        if (!current.subfields.includes(name)) current.subfields.push(name);
      } else {
        (current.invalidSubfields ??= []).push(name);
      }
      current.empty = false;
      continue;
    }
    if (trimmed) current.empty = false;
  }

  return { title, sections, legacyHeadings, unknownHeadings, duplicates, updateLog };
}

// ---- Language contract parsing (bilingual-gate; see checkpoint-format.md) ----

/** Single CJK/fullwidth character: radicals, CJK punctuation, kana, extensions, fullwidth forms. */
export const CJK_RE =
  /[\u2E80-\u2EFF\u3000-\u303F\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/;
const CJK_RE_G = new RegExp(CJK_RE.source, 'g');

/** Minimum CJK share of a mirror's letters — CJK / (CJK + Latin). */
export const MIRROR_CJK_MIN_RATIO = 0.3;

/**
 * Yield the lines outside fenced code blocks, dropping the fence markers
 * themselves. Both the ``` and ~~~ fence styles are recognized; a fence opens
 * on a line whose first non-space characters repeat the marker.
 */
function linesOutsideFences(text) {
  const out = [];
  let fence = null;
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^\s*(```+|~~~+)/.exec(line);
    if (m) {
      const marker = m[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence === null) out.push(line);
  }
  return out;
}

/**
 * Strip fenced blocks and inline code spans so quoted Chinese text, paths,
 * commands, and literal strings are exempt from the language counts.
 */
export function stripCodeSpans(text) {
  return linesOutsideFences(text)
    .map((line) => line.replace(/`[^`\n]*`/g, ''))
    .join('\n');
}

export function cjkCount(text) {
  return (String(text).match(CJK_RE_G) ?? []).length;
}

export function latinCount(text) {
  return (String(text).match(/[A-Za-z]/g) ?? []).length;
}

/** CJK share of letters (CJK + Latin); 0 when the text holds neither. */
export function cjkRatio(text) {
  const cjk = cjkCount(text);
  const total = cjk + latinCount(text);
  return total === 0 ? 0 : cjk / total;
}

/** `##`/`###` headings outside fenced code, as `h2 <name>` / `h3 <name>`, in order. */
export function collectHeadings(text) {
  const out = [];
  for (const line of linesOutsideFences(text)) {
    const h = /^(#{2,3})\s+(.*?)\s*$/.exec(line);
    if (h) out.push(`${h[1]} ${h[2]}`);
  }
  return out;
}

/** First-column cells of markdown tables headed by an `ID` column, in order. */
export function collectTableIds(text) {
  const ids = [];
  let inTable = false;
  let tableIsId = false;
  for (const line of linesOutsideFences(text)) {
    const t = line.trim();
    if (!t.startsWith('|')) {
      inTable = false;
      continue;
    }
    const cells = t
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (!inTable) {
      inTable = true;
      tableIsId = cells[0] === 'ID';
      continue;
    }
    if (!tableIsId || cells.every((c) => /^:?-+:?$/.test(c))) continue;
    ids.push(cells[0]);
  }
  return ids;
}

/** Exact H1 suffix every Chinese mirror carries. */
export const MIRROR_TITLE_SUFFIX = '\uFF08\u4E2D\u6587\u955C\u50CF\uFF09';
