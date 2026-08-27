# ctx

Session context compression for AI coding agents. ctx turns conversation-heavy
work into short, decision-oriented checkpoints under `.agents/context/`, so any
future agent can resume without replaying history.

中文版：[README.zh.md](README.zh.md)

## Why

Chat history is a poor memory: it is long, lossy, and gone by the next session.
Plain summaries lose the decision trail. A ctx checkpoint records **what was
asked, what was decided and why, what changed, what was verified, and where to
continue** — in a compact format any agent can read progressively.

## The five operations

| Operation | Means | Use when |
|---|---|---|
| `ctx` | show cache status + root index digest | orienting, or before create/append |
| `ctx-create` | open a NEW session checkpoint | first compaction of a session |
| `ctx-append` | merge MORE content into the current checkpoint | later compactions of the same session |
| `ctx-resume` | restore prior work via progressive disclosure | starting work that history may affect |
| `ctx-archive` | move superseded records into `archive/` | housekeeping after supersession |

Standing rules: ask when ambiguous (create vs append) · history is never erased ·
honest statuses only · English canon + Chinese mirror · no extra taxonomy.

## Cache layout

```text
.agents/context/
├── index.md                                 # root index — the resume entry point
├── <thread>/<date>-<HHMM>-<slug>.md         # English canon
├── <thread>/<date>-<HHMM>-<slug>.zh.md      # Chinese mirror
├── <thread>/<date>-<HHMM>-<slug>.i18n.yaml  # sync credentials (blob hashes)
└── archive/                                 # superseded records, never deleted
```

## Install

ctx is a plain Agent Skill — no runtime, no dependencies.

| Host | How |
|---|---|
| Any Agent Skills host (Claude Code, pi, OpenCode, Codex, …) | put `skills/ctx/` into your host's skill discovery path, or read `skills/ctx/SKILL.md` directly |
| pi | `pi install git:github.com/xypur/ctx` (or a local path) — adds the skill, the `/ctx*` commands, and a session-start cache hint |
| OpenCode | copy `.opencode/command/ctx*.md` (5 files) into your project's `.opencode/command/` |
| Any host with project instructions | add a resume pointer to your `AGENTS.md` / `CLAUDE.md` — see this repo's root [AGENTS.md](AGENTS.md) for the pattern |

Codex / Claude Code plugin adapters are planned — see the roadmap in
[docs/agent-portability.md](docs/agent-portability.md).

## Relationship to ponytail

[ponytail](https://github.com/DietrichGebert/ponytail) is an always-on behavior
mode for how an agent writes code. ctx is an on-demand memory operation for what
the agent did. ctx borrows ponytail's adapter-portability layering (thin
adapters, one canon) but depends on none of its files. They compose: ponytail
shapes the writing; ctx remembers the work.

## Docs

- [`skills/ctx/SKILL.md`](skills/ctx/SKILL.md) — the skill (behavior contract)
- [`skills/ctx/references/`](skills/ctx/references/) — cache layout, file naming, checkpoint format
- [`docs/agent-portability.md`](docs/agent-portability.md) — adapter matrix
- [`examples/`](examples/) — example caches; [`skills/ctx/scripts/doctor.mjs`](skills/ctx/scripts/doctor.mjs) validates any cache
