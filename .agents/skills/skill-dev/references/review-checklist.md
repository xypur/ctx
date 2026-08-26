# Skill Review Checklist

Work through every section before releasing a new skill or a significant modification. Each item is phrased so it can be answered yes/no.

## 1. Triggering (frontmatter)

- [ ] `name` matches the directory name, in `kebab-case`.
- [ ] `description` states both **what the skill does** and **when to use it**.
- [ ] `description` contains at least 3 concrete trigger scenarios ("Use when…").
- [ ] `description` mentions the domain nouns a user would actually type.
- [ ] `description` is 1–3 sentences with no usage instructions leaked into it.
- [ ] Near-miss cases considered: does the description avoid over-triggering on adjacent-but-wrong tasks? If triggering accuracy matters, design should-trigger / should-not-trigger eval queries (see writing-guide.md).

## 2. Progressive Disclosure

- [ ] `SKILL.md` body is under 500 lines.
- [ ] The most important guidance appears in the first half of the body.
- [ ] Detailed/occasionally-needed material lives in `references/`, not inline.
- [ ] Every reference file has a pointer from the body saying *when* to read it.
- [ ] Reference files over 300 lines include a table of contents.
- [ ] Deterministic repeated steps are in `scripts/` (if applicable).
- [ ] Output templates / static assets are in `assets/` (if applicable).

## 3. Writing Style

- [ ] Instructions are in imperative form.
- [ ] Rules carry their reasoning ("do X because Y") instead of bare MUSTs; all-caps ALWAYS/NEVER are rare or absent.
- [ ] Guidance generalizes beyond the specific examples that motivated it.
- [ ] Quick-reference data uses tables; procedures use numbered steps; scenarios use bullets; trees/commands use code blocks.

## 4. Structure

- [ ] Follows the default skeleton (When to Use / Workflow / additional sections), keeping `Prohibitions` and `When Unsure` only when they earn their place.
- [ ] Workflow steps are numbered and ordered as the agent should actually execute them.
- [ ] No contradictions between sections.

## 5. Evaluation

- [ ] 2–3 realistic test prompts exist (`evals.json` or PR description), each with an expected outcome.
- [ ] Test prompts were actually run against the skill, or the user explicitly opted out.
- [ ] For subjective-output skills, results were reviewed qualitatively by the user.

## 6. Host Integration

- [ ] If the host collection maintains provenance metadata (`GENERATION.md`) or a changelog (`CHANGES.md`), they were created or updated.
- [ ] Changelog entries describe what changed and why.
- [ ] Any skill index, catalog, or README listing available skills was updated, including the install command where applicable.
