#!/usr/bin/env node

import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const args = process.argv.slice(2).filter((a) => a !== '--help');
if (args.length !== 1) {
  console.error('usage: node init.mjs <context-root>');
  process.exit(2);
}

const root = resolve(args[0]);
const files = [
  {
    path: 'index.md',
    body: [
      '# Context Index',
      '',
      'AI-facing first entry to project memory. One summary line per active record:',
      'Problem → Decision → Consequences → Verification.',
      '',
      '## Active Threads',
      '',
      '| Thread | Head | Updated |',
      '|---|---|---|',
      '',
      '## Records',
      '',
      '## Archive',
      '',
      'Superseded/archived records: [archive/index.md](archive/index.md)',
      '',
    ].join('\n'),
  },
  {
    path: 'archive/index.md',
    body: [
      '# Archive Index',
      '',
      'One line per superseded/archived record, newest first.',
      '',
      '',
    ].join('\n'),
  },
];

for (const f of files) {
  if (existsSync(resolve(root, f.path))) {
    console.error(`init: refusing to overwrite existing ${f.path}`);
    process.exit(2);
  }
}

mkdirSync(resolve(root, 'archive'), { recursive: true });
for (const f of files) writeFileSync(resolve(root, f.path), f.body);

console.log(`initialized cache skeleton at ${relative(process.cwd(), root)}`);
