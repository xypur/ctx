// ctx pi extension: registers the five ctx operations as slash commands and
// injects the shared activation hint once per session. Thin adapter — no rule
// text lives here: commands expand to "/skill:ctx <operation>" so the skill
// body is loaded by pi, and the hint text comes from hooks/ctx-hint.js
// (single source of truth, shared with the Claude/Codex hook).

import { ctxActivationHint } from "../hooks/ctx-hint.js";

/** The five operations, mirroring skills/ctx/SKILL.md's operation map. */
export const OPERATIONS = [
  "ctx",
  "ctx-create",
  "ctx-append",
  "ctx-resume",
  "ctx-archive",
];

/**
 * Build the user message for a ctx command: expand the ctx skill, then name the
 * operation. No procedural rule text is embedded (thin-command requirement).
 */
export function buildSkillMessage(operation, args) {
  const trimmed = String(args || "").trim();
  const opLine = `Execute the ${operation} operation`;
  return `/skill:ctx ${opLine}${trimmed ? ` with: ${trimmed}` : ""}`;
}

export default function ctxExtension(pi) {
  let pendingHint = null;

  for (const operation of OPERATIONS) {
    pi.registerCommand(operation, {
      description: `Run the ctx skill's ${operation} operation`,
      handler: (args, ctx) => {
        const message = buildSkillMessage(operation, args);
        if (ctx?.isIdle?.() === false) {
          pi.sendUserMessage(message, { deliverAs: "followUp" });
          ctx?.ui?.notify?.("ctx command queued as follow-up.", "info");
          return;
        }
        pi.sendUserMessage(message);
      },
    });
  }

  pi.on("session_start", async (_event, ctx) => {
    pendingHint = ctxActivationHint(process.cwd());
    if (pendingHint) {
      ctx?.ui?.notify?.(
        "ctx: context cache found — /ctx-resume to restore prior work.",
        "info",
      );
    }
  });

  pi.on("before_agent_start", async (event) => {
    if (!pendingHint) return;
    const hint = pendingHint;
    pendingHint = null; // inject once per session
    const base = event?.systemPrompt ? `${event.systemPrompt}\n\n` : "";
    return { systemPrompt: `${base}${hint}` };
  });
}
