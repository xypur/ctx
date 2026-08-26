# Writing Guide

Deeper guidance on two high-leverage aspects of skill authoring: the `description` field (which decides triggering) and body writing style.

## Description Optimization

The frontmatter `description` is shown to the model in every session as part of the available-skills list. The model consults a skill based on this text alone, so it is the single highest-leverage line in the whole package.

### How triggering actually works

- The model sees only `name` + `description` until it decides to load the skill.
- Models tend to **under-trigger**: they skip skills that would help. Slightly "pushy" descriptions counteract this.
- Simple one-step tasks may not trigger any skill even with a perfect description match — the model handles them directly. Descriptions should therefore target substantive, multi-step, or specialized work.
- Over-triggering is also real: a description full of generic keywords fires on adjacent-but-wrong tasks and wastes context.

### Designing trigger evaluation queries

To test or tune a description objectively, write ~20 realistic queries split into should-trigger and should-not-trigger sets:

```json
[
  {"query": "...", "should_trigger": true},
  {"query": "...", "should_trigger": false}
]
```

**Should-trigger queries (8–10):**

- Cover different phrasings of the same intent — formal and casual.
- Include cases where the user never names the skill or its domain explicitly but clearly needs it.
- Include uncommon use cases and cases where this skill competes with another but should win.
- Make them concrete: file paths, project context, column names, real-sounding backstories. Mix lengths; allow typos and abbreviations.

Bad: `"Write a Vue component"`
Good: `"我们组件库里那个 Select 的 props 快 20 个了，新同事又要加一个 loading 态，帮我按库里的规范理一下 API，顺便看看 emits 是不是该拆"`

**Should-not-trigger queries (8–10):**

- Near-misses are the valuable ones — queries sharing keywords or domain with the skill but actually needing something different (adjacent framework, different task type).
- Avoid obviously irrelevant negatives ("write fibonacci") — they test nothing.

If iterating on descriptions: evaluate each candidate on all queries, pick the best performer on the should/should-not balance, and guard against overfitting by keeping some queries held out from the improvement loop.

### A quick description rewrite pass

1. Underline every capability claim — is the *what* clear in the first sentence?
2. Count trigger scenarios — fewer than 3? Add phrasings from real user language.
3. Search for usage instructions that leaked in — move them to the body.
4. Read it as a competing skill would — would it steal this trigger? Sharpen distinguishing nouns.

## Body Writing Style

### Explain the why

Compare:

Weak (bare rule):

```markdown
NEVER use default exports in component files.
```

Strong (rule + why):

```markdown
Use named exports for components: bundlers tree-shake named exports reliably,
editor auto-import resolves them unambiguously, and a missing rename shows up
as an import error instead of a silent `undefined` at runtime.
```

The second version lets the model apply the *reason* to situations the rule never mentioned. Save hard prohibitions for things that are always wrong regardless of context.

### Generalize from feedback

When a review says "this output was wrong", fix the class of problem, not the instance:

1. Ask what misunderstanding produced the wrong output.
2. Decide whether the fix is a new explanation, a better example, a restructure, or a script.
3. Prefer explanations over enumerations of special cases — enumerations grow without bound.

A useful test: imagine the skill used on a prompt you have never seen. Would your fix still help?

### Keep the prompt lean

Every line of the body is read on every trigger of the skill. Audit for:

- Sections no test run ever benefited from → delete.
- Instructions the model already does unprompted → delete.
- Repeated caveats → say once, in the right place.

If removing something feels risky, note that a shorter skill triggers faster reasoning and less drift; verbosity is a cost, not safety.

### Examples pattern

Concrete input/output pairs teach style efficiently:

```markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

Keep examples representative, not pathological — models imitate the shape of what they see.
