# Changelog

## 2026-08-24

### Generalized into a public skill

- Removed repository-specific conventions: deleted all bilingual-sync content (trigger scenarios, Step 7 steps, quick-reference row, Prohibitions item, and review checklist section 6); bilingual sync is a convention unique to this repository.
- Generalized package paths: skill directories are no longer limited to `skills/<skill-name>/`; they are self-contained `<skill-name>/` directories whose parent depends on the host environment. `GENERATION.md` / `CHANGES.md` changed from "required" to "follow if the host uses them".
- Updated the description and "When to Use" accordingly in both language versions and both review checklists.

### Added Chinese reference documents

- Added `zh/skill-dev/references/review-checklist.zh.md` and `zh/skill-dev/references/writing-guide.zh.md`, mirroring the English `references/`.
- Repointed the Step 6 links in `SKILL.zh.md` to the Chinese reference files.

### Created skills/skill-dev

Created the skill development methodology pack, distilling a set of universal skill-writing guidelines:

- `SKILL.md`: English definition. Key contents:
  - Four core principles (three-level progressive disclosure, "explain the why instead of stacking MUSTs", generalize rather than overfit, script the deterministic parts)
  - Seven-step workflow: capture intent → design package structure (with `scripts/` / `assets/` resource layering) → frontmatter/description → body → test prompts (evals.json format) → review checklist → finalize integration
  - Prohibitions / When Unsure sections kept only when they earn their place, not as a mandatory skeleton
- `references/review-checklist.md`: pre-release quality checklist (seven groups: triggering, progressive disclosure, writing style, structure, evaluation, bilingual sync, repository integration)
- `references/writing-guide.md`: description optimization methodology (should-trigger / should-not-trigger query design, near-miss negatives) and body writing style guide
- `GENERATION.md`: source and generation metadata

Also created the Chinese version `zh/skill-dev/SKILL.zh.md`, structurally identical to the English version.
