// Shared activation-hint constant + cache detection for ctx adapters.
// Single source of truth for cross-host text: the pi extension
// (pi-extension/index.js) and the Claude/Codex session hook
// (hooks/ctx-activate.js, module plugin-claude-codex) both import from here.
// Zero third-party dependencies, per the repo's scripts discipline.

import { existsSync } from "node:fs";
import { join } from "node:path";

/** Repo-relative path of the ctx root index — the resume entry point. */
export const CTX_INDEX_REL = ".agents/context/index.md";

/**
 * Return the absolute path of the ctx root index if the cache exists, else null.
 * Detection signal = existence of the root index only (matches init.mjs output;
 * content inspection is left to ctx-resume's progressive disclosure).
 */
export function findCtxIndex(cwd = process.cwd()) {
  const p = join(cwd, CTX_INDEX_REL);
  return existsSync(p) ? p : null;
}

/**
 * Return the activation hint for the given cwd, or null when there is no cache
 * (adapters MUST stay silent in that case). Constant text + actual path only —
 * never read or paraphrase index content.
 */
export function ctxActivationHint(cwd = process.cwd()) {
  if (!findCtxIndex(cwd)) return null;
  const cacheRoot = join(cwd, ".agents", "context");
  return (
    `ctx: context cache found at ${cacheRoot}. ` +
    `To resume prior work, read ${CTX_INDEX_REL} first, ` +
    "then follow the ctx skill's progressive disclosure."
  );
}
