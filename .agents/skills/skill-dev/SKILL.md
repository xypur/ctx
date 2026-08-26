---
name: skill-dev
description: "Create new skills, modify and improve existing skills, and review or measure skill quality. Use when users want to create a skill from scratch, edit or refactor an existing skill, run test prompts to evaluate how well a skill works, optimize a skill's description for better triggering accuracy, or check whether a skill follows good structure and writing conventions."
---

# Skill Development

A methodology for designing, writing, testing, and maintaining high-quality skill packs — covering intent capture, package structure, description optimization, evaluation, and repository integration.

## When to Use This Skill

- Creating a new skill package from scratch
- Editing, refactoring, or restructuring an existing skill
- Improving a skill's `description` frontmatter for better triggering accuracy
- Reviewing a skill's quality before release or after modification
- Adding test prompts / evaluations to verify a skill works

## Core Principles

These principles explain **why** skills are written this way. Apply them throughout every step.

### 1. Progressive Disclosure — context is the scarce resource

Skills are loaded in three levels. Design each level deliberately:

| Level | What | Loaded | Budget |
|---|---|---|---|
| 1 | Frontmatter `name` + `description` | Always (every session) | ~100 words |
| 2 | `SKILL.md` body | When the skill triggers | Under 500 lines |
| 3 | Bundled resources (`references/`, `scripts/`, `assets/`) | On demand, as needed | Unlimited; scripts can run without being loaded |

This is why the `description` decides everything (level 1 must earn the trigger), and why detailed material belongs in `references/` rather than inflating the body.

### 2. Explain the why instead of stacking MUSTs

Modern LLMs reason well. An instruction with its reasoning ("do X because Y breaks otherwise") generalizes to cases the author never anticipated; a bare `ALWAYS`/`NEVER` does not. If you catch yourself writing heavy-handed all-caps rules, reframe: explain what goes wrong without it. Reserve hard prohibitions for things that are genuinely always wrong.

### 3. Generalize, don't overfit

A skill will be used across countless future prompts, but you iterate on only a few examples. When fixing feedback, ask "does this fix generalize?" A fiddly patch for one example is overfitting; a better explanation, metaphor, or pattern benefits every future use.

### 4. Script the deterministic parts

If every invocation of the skill would repeat the same mechanical steps (scaffolding files, validating structure, generating boilerplate), write that logic once into `scripts/` and have the skill call it. Every future run saves the tokens and errors of reinventing it.

## Workflow

### Step 1: Capture Intent

Answer these before writing anything. Extract answers from the current conversation first if the user says something like "turn this into a skill"; only ask the user to fill gaps:

1. What should this skill enable the agent to do?
2. When should it trigger? (user phrases, contexts, near-misses)
3. What is the expected output / behavior when it fires?
4. Does the skill have objectively verifiable outcomes (file transforms, fixed workflows)? If yes, plan test prompts in Step 5. If outputs are subjective (writing style), rely on review instead.

### Step 2: Design the Package Structure

Every skill is a self-contained directory whose name matches its purpose:

```
<skill-name>/
├── SKILL.md          # Skill definition (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled resources (optional)
    ├── references/   # Detailed docs loaded on demand
    ├── scripts/      # Executable code for deterministic/repetitive tasks
    └── assets/       # Files used in output (templates, icons, fonts)
```

- Skill directory name: `kebab-case`, matching the frontmatter `name`.
- The parent directory depends on the host environment (a personal skills folder like `~/.claude/skills/`, a project-level `.agents/skills/`, or a curated collection repository). Nothing inside the package assumes a particular location.
- Some hosts or collections layer on extra conventions (provenance metadata such as `GENERATION.md`, changelogs, skill catalogs); follow those where they exist, but they are not part of the skill format itself.
- When a skill supports multiple domains/variants, organize by variant so only the relevant file gets read:
  ```
  <skill-name>/
  ├── SKILL.md         # workflow + variant selection
  └── references/
      ├── aws.md
      └── azure.md
  ```

### Step 3: Write the Frontmatter and Description

The `description` is the primary triggering mechanism — level 1 of progressive disclosure. It must contain both **what the skill does** and **when to use it**, listing concrete trigger scenarios. Lean slightly pushy: models tend to under-trigger skills, so mention adjacent phrasings and related keywords the user might say without naming the skill directly.

**Weak** (what only, no triggers):

```yaml
description: "Vue component library conventions."
```

**Strong** (what + when + trigger scenarios):

```yaml
description: "Vue 3 component library authoring conventions. Use when writing or reviewing library components, designing props/emits/slots APIs, deciding emits vs callback props in JSX, or organizing tests and hooks in a component library."
```

Rules of thumb:

- One to three sentences; front-load the capability.
- Include 3+ concrete trigger scenarios ("Use when…").
- Mention key domain nouns users would actually type.
- Do not put usage instructions in the description — that belongs in the body.

### Step 4: Write the Body

Use this skeleton as the default, keeping sections only when they earn their place:

```markdown
# <Skill Title>

<One-line overview.>

## When to Use This Skill
<Concrete bullet-list trigger scenarios.>

## Workflow
<Numbered steps; use ### Step N: headings for procedures.>

## <Additional Sections>
<Tables for quick reference, decision flows, code examples.>

## Prohibitions          ← keep only if there are hard rules
## When Unsure           ← keep only if a sensible fallback exists
```

Formatting conventions:

- **Tables** for quick-reference data (mappings, options, naming).
- **Numbered steps** for procedural guidance; **bullet lists** for scenarios and constraints.
- **Code blocks** for directory trees and commands.
- Front-load the most important guidance — assume later sections may never be read.

Writing style:

- Prefer imperative form ("Run X", "Put Y in Z").
- Explain reasoning inline (Principle 2).
- Keep the body under 500 lines; if approaching the limit, move detail into `references/` and leave a pointer saying *when* to read each reference file. For reference files over 300 lines, include a table of contents.

### Step 5: Create Test Prompts

Write 2–3 realistic test prompts — the kind a real user would actually type, not abstract summaries — and record expected outcomes. Save them as `evals.json` alongside the skill (or in the PR description if the repo prefers):

```json
{
  "skill_name": "<skill-name>",
  "evals": [
    {
      "id": 1,
      "prompt": "The task prompt as a user would phrase it",
      "expected_output": "What a correct result looks like"
    }
  ]
}
```

Good prompts are specific and substantive enough that the agent would genuinely benefit from consulting the skill. Then run them (directly or via subagents) and check the outputs against `expected_output`. For subjective-output skills, present results to the user for qualitative judgment instead of forcing assertions.

### Step 6: Review Against the Checklist

Before finalizing, work through the quality checklist in [references/review-checklist.md](references/review-checklist.md). It covers triggering, progressive disclosure, writing style, structure, evaluation, and host integration.

For deeper guidance on description optimization (should-trigger / should-not-trigger query design, near-miss negatives) and writing-style patterns, see [references/writing-guide.md](references/writing-guide.md).

### Step 7: Finalize Integration

Adapt to the conventions of wherever the skill will live (a personal skills directory, a project, or a curated collection):

1. If the host maintains provenance metadata (e.g., `GENERATION.md`) or a changelog (e.g., `CHANGES.md`), create or update them.
2. Update any skill index, catalog, or README that lists available skills, including the install command where applicable.
3. Walk through the release checklist once more, end to end.

## Quick Reference

| Decision | Rule |
|---|---|
| Directory / skill name | `kebab-case`, matches frontmatter `name` |
| Description content | Capability + 3+ trigger scenarios, slightly pushy |
| Body length | Under 500 lines; overflow goes to `references/` |
| Deterministic repeated steps | Move to `scripts/` |
| Output templates / fonts / static files | Put in `assets/` |
| Package location | `<any-parent>/<skill-name>/`; parent depends on host |
| Hard MUSTs / ALL-CAPS rules | Avoid; explain the why instead |
| Verification | Test prompts + review checklist |

## Prohibitions

- Do not create skills whose contents would surprise the user relative to their stated intent (malware, exploit code, exfiltration helpers).
- Do not stuff usage instructions or long tables into the `description` field.
- Do not let `SKILL.md` grow past ~500 lines by inlining material that belongs in `references/`.
- Do not write fixes that only patch the specific test example without considering generalization.

## When Unsure

- Whether a section is needed → omit it; add back if a real case demands it.
- Whether something deserves `references/` → if the agent needs it only sometimes, yes; if always, keep it in the body.
- How rigorous testing should be → default to 2–3 test prompts with recorded expectations, and let the user decide whether deeper evaluation is worth it.
