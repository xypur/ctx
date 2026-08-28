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
