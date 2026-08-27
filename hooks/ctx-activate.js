#!/usr/bin/env node
// ctx — Claude Code / Codex SessionStart activation hook.
//
// Silence is the default: emits the activation hint ONLY when a ctx cache
// exists in the project cwd (detection + text come from ./ctx-hint.js, the
// cross-host single source of truth). No cache → no output, no side effects.
//
// Output shapes (mirrors the ponytail-runtime protocol findings):
//   - native Claude Code: SessionStart accepts raw stdout as context
//   - Codex (PLUGIN_DATA set): hookSpecificOutput JSON form
//   - Copilot (COPILOT_PLUGIN_DATA set): additionalContext JSON form

import { ctxActivationHint } from "./ctx-hint.js";

const isCodex = Boolean(process.env.PLUGIN_DATA);
const isCopilot = Boolean(process.env.COPILOT_PLUGIN_DATA);

try {
  const hint = ctxActivationHint(process.cwd());
  if (hint) {
    if (isCodex) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: hint },
        }),
      );
    } else if (isCopilot) {
      process.stdout.write(JSON.stringify({ additionalContext: hint }));
    } else {
      process.stdout.write(hint);
    }
  }
} catch {
  // stdout closed/EPIPE at hook exit must not surface as a hook failure
}
process.exit(0);
