---
deepwiki: https://deepwiki.com/search/-context_b8dc1f3e-a2b4-419a-995d-95790480887f?mode=deep
---


该项目对会话上下文的压缩（压缩，即 compaction）是作为一个独立的"能力 seam"（capability seam）实现的，分为约定层和实现层，核心思路是：用摘要替换较早的一段历史事件，只保留近期的完整内容，同时保证日志本身永不丢失数据。

## 架构分层

**1. 接口层 `@deepseek-ai/dsh-compaction`**

定义抽象的 `CompactionEngine`，拥有 `ctx.compaction` 服务键、`CompactionResult` 词汇、`compaction/*` 会话事件类型，以及规范化的检查点消息来源标记 `COMPACT_CHECKPOINT_SOURCE`/`isCompactCheckpointSource`。它声明三个抽象方法：`compactIfNeeded()`、`compactNow()`、`compactRegion()`，只规定"做什么"，不规定"怎么做"。 [1](#0-0) 

**2. 实现层 `@deepseek-ai/dsh-compaction-basic`**

具体的 `BasicCompactionEngine`，消费 `ctx.tokenMeter` 服务做 token 测量，负责尾→头的保留遍历、通过 `ctx.llm.stream()` 生成摘要、执行 surface（会话表层）替换、加锁、步骤前压力检测和规范的上下文溢出恢复。 [2](#0-1) 

**3. 可选配套 `@deepseek-ai/dsh-compaction-tool-result-pruner`**：在选择摘要范围前，先重写过大的 `tool/result` 节点（不依赖模型），可以避免或减少摘要调用。 [3](#0-2) 

**4. 人类可控入口 `@deepseek-ai/dsh-command-compact`**：注册 `/compact` 命令，调用 `compactNow()`。 [4](#0-3) 

## 触发时机

- **自动压力压缩**：在每次成功步骤后的 `agent/pre-step` 扩展点检查，测量当前已记录请求的 token 压力，超过阈值就压缩。
- **溢出强制恢复**：当 provider 报告上下文窗口溢出（context-overflow）时，通过 `agent/request-error` 触发，绕过常规阈值，执行一次最大平衡的头部缩减后重试。 [5](#0-4) 

## 压缩算法（保留策略）

`compactIfNeeded` 保留估算大小达到"保留 token 预算"的最小完整 surface 单元尾部（一个单元是一个完整闭合的 step，或一条无 step 的消息），压缩更旧的节点；若 token 截断点落在 step 内部，会扩展保留范围直到工具调用/结果配对平衡（不能拆散一对 tool-call/result）。压缩以轮次（turn）无关，甚至可以在同一轮次内多次压缩早期已闭合的工具步骤。 [6](#0-5) 

默认配置：`thresholdRatio: 0.8`（在上下文窗口的 80% 处触发压缩）、`retainRatio: 0.16`（保留 16% 作为近期尾部）、`maxTokens: 8192`（摘要生成上限）、`compactionRetries: 1`（收敛重试次数）。 [7](#0-6) 

## Surface 替换机制

由于 `SurfaceEventType` 是封闭的（只有 `user/message`、`assistant/message`、`tool/result` 可以携带 `surfaceOp`），压缩不能把自身事件放到 surface 上。因此后端追加**一条 `user/message`**，携带 `source: COMPACT_CHECKPOINT_SOURCE` 和 `surfaceOp: { op: 'replace', start, end }`，其内容是被 `<compacted-summary>` 标签框住的摘要文本，`sourceEventSeqs` 记录所有被遮蔽（shadowed）的原始事件序号： [8](#0-7) 

整个事务的日志顺序为：
```
compaction/start    → 仅日志，获取锁
[通过后端调用摘要模型]
compaction/summary  → 仅日志，记录原始摘要、被遮蔽 seq、token 数
user/message        → 带 surfaceOp: replace，真正的表层变更（框定后的摘要）
compaction/end       → 仅日志，释放锁
``` [9](#0-8) 

## 摘要生成

摘要调用直接使用 `ctx.llm.stream()`，把会话自身的系统提示词、工具 schema 和被遮蔽区域的消息逐字回放，末尾追加固定的压缩指令（要求输出结构化的 Markdown 检查点：Primary Request and Intent、Key Technical Concepts、Files and Code、Errors and Fixes 等分节），这样可以复用 provider 的热 KV Cache。 [10](#0-9) [11](#0-10) 

## 关键：日志永不丢失，只是"投影"不同

一个重要的设计点是：`Session.events` 中原始的每条消息和完整工具结果**从未被删除**，压缩只是修改了"表层（surface）"——也就是接下来要发给模型的内容。人类可读的 transcript（终端、Web 前端）不读 surface，而是按日志顺序读取"追加来源"（append-origin）事件，并在压缩落地处渲染一行折叠标记，这样用户已读过的历史对话不会消失。 [12](#0-11) 

## 相关代码位置

- `packages/compaction/compaction/`：接口/约定包
- `packages/compaction/compaction-basic/`：具体压缩后端实现，摘要 prompt 见 `packages/compaction/compaction-basic/src/summarizer.ts`
- `packages/compaction/compaction-tool-result-pruner/`：无模型剪枝配套
- `packages/compaction/command-compact/`：`/compact` 命令
- `packages/llm/token-meter/`：token 压力测量服务 `ctx.tokenMeter` [13](#0-12) 

若需要更完整的实现细节（例如 `compactRegion`/`compactIfNeeded` 的完整源码），由于索引大小限制，部分文件内容可能未被完全收录，建议启动一个 Devin 会话来访问代码仓库的完整内容。

### Citations

**File:** .agents/notes/implemented/feature/2026-06-18-compaction-capability-seam.md (L17-24)
```markdown
### Compaction is a capability seam with separate Service Definition and Service Provider roles

Per the [capability-seams Agent Note](../architecture/2026-06-13-capability-seams.md), compaction ships as separate packages so the contract, the algorithm, and (later) the consumer API evolve independently:

1. **Interface** — `@deepseek-ai/dsh-compaction`: an abstract `CompactionEngine` owning the `ctx.compaction` key, the `CompactionResult` vocabulary, the `compaction/*` session events, the manual failure taxonomy, and the canonical checkpoint message source. It declares `compactIfNeeded()`, `compactNow()`, and `compactRegion()` as **abstract** — the contract states *what* compaction does, not *how*.
2. **Implementation** — `@deepseek-ai/dsh-compaction-basic`: a concrete `BasicCompactionEngine` that consumes `ctx.tokenMeter` and owns the tail→head retention walk, summarization via `ctx.llm.stream()`, the surface replacement, the lock, pre-step pressure, and canonical context-overflow recovery. `summarize()` is its sole subclass hook; pricing and replay stay with the meter.
3. **Model-free companion** — `@deepseek-ai/dsh-compaction-tool-result-pruner`: a concrete optional service that rewrites oversized current `tool/result` nodes before the backend selects a summary range. It is not a second compaction implementation and does not implement `CompactionEngine`.
4. **Human consumer** — `@deepseek-ai/dsh-command-compact` registers argument-free `/compact` through `ctx.commands` and calls the backend-independent `compactNow()` operation. It is direct human control, not a model-facing tool.
```

**File:** .agents/notes/implemented/feature/2026-06-18-compaction-capability-seam.md (L38-52)
```markdown
### Automatic pressure runs after successful durable step work

Successful-call pressure runs at the next `agent/pre-step`, after the preceding response, tool results, buffered context, and steering are durable and before the next request is derived. `dsh-compaction-basic` measures the canonical logged request through `ctx.tokenMeter`, so the next request sees any replacement without a speculative envelope override. Once pressure qualifies, optional `ctx.toolResultPruner` rewriting runs before summary selection; compaction-basic remeasures the durable surface and skips summarization if pruning restores safe pressure.

Canonical provider context overflow takes a separate path. The failed step closes and `agent/request-error` receives the original request error. Compact-basic owns its per-agent overflow count, prunes before forcing one useful balanced reduction, and returns `{ kind: 'retry' }` only if `session.surface.replaceGeneration` increases, including pruning-only progress when no summary range exists. The loop then closes the failed turn, opens a new numbered retry turn, and reconstructs its request from the durable log. No replacement, a recovery failure before any replacement, cancellation, an exhausted cap, or an unrelated error preserves the original provider failure. If pruning already advanced the generation before later summary work fails, recovery retries from that durable pruned surface un ... (truncated)

```
assistant/message → tool/result/context/steering → step/end
claim the next batch → await waterfall agent/pre-step  ⟵ pressure compaction before the next request
enter → next step/start

provider overflow → step/end
await waterfall agent/request-error  ⟵ forced compaction between attempts
retry → next numbered step/start      ⟵ derives from the replacement surface
```
```

**File:** .agents/notes/implemented/feature/2026-06-18-compaction-capability-seam.md (L54-60)
```markdown
### Retention is turn-agnostic; tool-pairing balance is the only structural guard

Auto-compaction checks after **every successful** step, not once per turn. This is load-bearing for runaway-turn survival: a tool-heavy ReAct turn appends an `assistant/message` + a `tool/result` per step, so the surface grows within a turn. The next pre-step check can compact early closed tool pairs before continuation opens another step, and provider-confirmed overflow remains the backstop when a request crosses the limit first.

`compactIfNeeded` retains the smallest tail of whole surface units whose estimated size reaches the resolved retained-token budget and compacts older nodes. A unit is a complete closed step or one no-step message. If the token cutoff lands inside a step, retention expands until the cut is tool-pairing balanced. Balance is checked on surface order, not log sequence, because replacement summaries have new sequence numbers at old surface positions. `dsh-compaction` exports the before/after edge helpers; their per-session cache folds only appended surface-tail nodes while `replaceGeneration` is unchanged, does no event reads for log-only growth, and rebuilds current membership and balances after replacement. `compactRegion` rejects boundaries that split a tool call from its result. The in-flig ... (truncated)

A runaway turn thus compacts exactly like any other history: its early *closed* steps get summarized while its recent steps stay verbatim. When the only compactable content left is an un-splittable open tail step (its tool-calls have no results yet), compaction declines (`null`) and retries once that step closes.
```

**File:** .agents/notes/implemented/feature/2026-06-18-compaction-capability-seam.md (L72-84)
```markdown
### Surface replacement: `compaction/*` events are log-only; one `user/message` carries the summary

Because `SurfaceEventType` is closed, the summary cannot ride on a `compaction/*` event. The backend instead appends a **single `user/message`** with `source: COMPACT_CHECKPOINT_SOURCE` and `surfaceOp: { op: 'replace', start, end }` whose `content` is the (framed) summary and whose `sourceEventSeqs` covers the shadowed entries *and* the bookkeeping events. The interface exports that source and `isCompactCheckpointSource()` so consumers recognize a persisted or cloned checkpoint without depending on backend package identity. The `compaction/*` events record the lock, summary, selected range, shadowed seqs, token count, and model call without joining the surface. The surface mutation sits **inside** the lock — `compaction/end` is the last event appended:

```
compaction/start    → log-only. Acquires the lock.
[summarize older range via the backend]
compaction/summary  → log-only. Records the raw summary, local-call marker, range, shadowed seqs, and token count.
user/message     → canonical checkpoint source + surfaceOp { op:'replace', start, end }.
                   THE surface mutation (framed summary).
                   deriveMessages() renders it as a user-role message.
compaction/end      → log-only. Releases the lock (carries `error` on a recoverable failure).
```
```

**File:** .agents/notes/implemented/feature/2026-06-18-compaction-capability-seam.md (L121-126)
```markdown
- **Packages**: `packages/compaction/compaction` supplies the interface, `compaction-basic` supplies the backend, `compaction-tool-result-pruner` supplies optional deterministic rewriting, and `command-compact` supplies human `/compact`. `packages/llm/token-meter` owns replay-aware measurement independently.
- **Automatic extension points**: `agent/pre-step` (`@mode waterfall`) handles pressure before request derivation and `agent/request-error` (`@mode waterfall`) handles final request failures after the failed step closes. The pre-step payload carries the claimed batch, turn, step, and signal (see the [payload-object events decision](../architecture/2026-08-06-agent-event-payload-objects.md)), with no compaction-only prompt/prefix payload.
- **`SessionEventMap`** gains `compaction/start` / `compaction/summary` / `compaction/end` by declaration merging (merge-extensible); `SurfaceEventType` is **not** touched. These are session events, not cordis `Events`, so the event-taxonomy gate needs no entry.
- **`dsh-compaction`** owns `COMPACT_CHECKPOINT_SOURCE`, `isCompactCheckpointSource(source)`, `toolPairingBalancedBefore(session, seq)`, and `toolPairingBalancedAfter(session, seq)`. The marker identifies replacement summaries across backend implementations. The cached surface-edge checks prevent `compactRegion` and `compactIfNeeded` from splitting a tool-call/result pair, validate current membership by seq, answer both edges from one per-cut balance sequence, and reject stale or missing seqs and orphan results.
- **`dsh-session`** validates positional replacement, complete cited source-event coverage, and content-only single-node `tool/result` rewrites through its one surface manager. Its invariant companion treats fresh appended tool results as executions that require an open step and pending call, while the compaction companion owns numeric-turn versus standalone-null bracket relations.
- **Wiring**: `examples/tui-agent/cordis.yml` loads zero-config `dsh-token-meter`, `dsh-compaction-tool-result-pruner`, `dsh-compaction-basic`, then `dsh-command-compact`; service-wide defaults make the composition usable without repeated numeric policy.
```

**File:** packages/compaction/compaction-basic/README.md (L1-9)
```markdown
# @deepseek-ai/dsh-compaction-basic

English | [中文](README.zh.md)

The **basic compaction backend**: a `BasicCompactionEngine` implementing the `@deepseek-ai/dsh-compaction` Service Definition with reusable `ctx.tokenMeter` pressure, token-budget retention, and summarization as a direct one-shot `ctx.llm.stream()` call that replays the conversation prefix to reuse the provider's KV cache (interceptable at `llm/stream`).

This package owns the Service Provider role of the compaction capability — see the [Service Definition package](../compaction/README.md) for its contract and the [capability-seam Agent Note](../../../.agents/notes/implemented/feature/2026-06-18-compaction-capability-seam.md) for the design.

## What it owns
```

**File:** packages/compaction/compaction-basic/README.md (L26-41)
```markdown
## Config (`BasicCompactionConfig`)

Every setting is optional. Top-level policy fields are defaults for every routed model; `modelPolicies` applies partial overrides to exact provider/model pairs. At pressure time, compaction-basic asks the owning LLM adapter for that route's context capacity and resolves absolute budgets. Unrecognized keys, duplicate targets, mutually exclusive retention forms, and a merged `retainRatio` that is not below `thresholdRatio` fail plugin load. An absolute `retainTokens` budget that is not below its scaled threshold fails on the first resolvable target because that comparison requires model capacity.

| Key | Required | Meaning |
|---|---|---|
| `thresholdRatio` | no (default `0.8`) | Compact at `floor(routedContextWindow × ratio)`. |
| `retainRatio` | no (default `0.16`) | Recent surface budget kept verbatim as a fraction of the routed context window; mutually exclusive with `retainTokens`. |
| `retainTokens` | no | Absolute recent surface budget kept verbatim; mutually exclusive with `retainRatio` and must be below the resolved threshold. |
| `summarizationProvider` | no (default `''`) | Set together with `summarizationModel`; an empty pair resolves the latest logged request target, then the `AgentOptions` pair. |
| `summarizationModel` | no (default `''`) | Set together with `summarizationProvider`; an empty pair resolves the latest logged request target, then the `AgentOptions` pair. |
| `maxTokens` | no (default `8192`) | Provider generation cap for the summarization call; may include reasoning tokens. |
| `compactionRetries` | no (default `1`) | Extra attempts after the first when pressure remains above threshold. |
| `maxOverflowRetries` | no (default `1`) | Maximum retries after canonical context-window overflow; `0` disables recovery only. |
| `modelPolicies` | no (default `[]`) | Exact `{ provider, model, ...partialPolicy }` overrides; matching uses both fields and does not depend on `listModels()`. |
| `auto` | no (default `true`) | Register step-boundary pressure and overflow-recovery listeners. Set `false` for manual-only. |
```

**File:** packages/compaction/compaction-basic/README.md (L105-118)
```markdown
### Auxiliary summarizer request

#### What the model sees

The summarization model receives the conversation replayed verbatim — the same system prompt, tool schemas, and messages the last routed request sent for the shadowed region — followed by one final user message: the compaction instruction below. The conversation model never sees this private request or its reasoning; only returned text is stored.

##### Compaction instruction (final user message)

```markdown
You are now acting as a compaction engine for this AI coding assistant. Condense the conversation ABOVE into a structured checkpoint that lets another model resume the work with no loss of essential context.

Output EXACTLY the Markdown structure below: keep every section, in order. Use terse bullets, not prose paragraphs. Write "(none)" for an empty section — never drop a section.

## Primary Request and Intent
```

**File:** .agents/notes/implemented/feature/2026-06-18-compaction-capability-seam.zh.md (L72-86)
```markdown
### Surface 替换：`compaction/*` 事件仅存在于日志；一条 `user/message` 承载摘要

由于 `SurfaceEventType` 是封闭的，摘要不能搭载在 `compaction/*` 事件上。后端改为追加**单条 `user/message`**，带有 `source: COMPACT_CHECKPOINT_SOURCE` 和 `surfaceOp: { op: 'replace', start, end }`；其 `content` 是（带框架的）摘要，`sourceEventSeqs` 覆盖被遮蔽的条目*和*簿记事件。接口导出该来源和 `isCompactCheckpointSource()`，使消费方无需依赖后端包身份，即可识别持久化或克隆得到的检查点。`compaction/*` 事件记录锁、摘要、选中区间、被遮蔽的 seq、token 数和模型调用，但不加入 surface。surface 变更位于锁**内部**，`compaction/end` 是最后追加的事件：

```
compaction/start    → log-only. Acquires the lock.
[summarize older range via the backend]
compaction/summary  → log-only. Records the raw summary, local-call marker, range, shadowed seqs, and token count.
user/message     → canonical checkpoint source + surfaceOp { op:'replace', start, end }.
                   THE surface mutation (framed summary).
                   deriveMessages() renders it as a user-role message.
compaction/end      → log-only. Releases the lock (carries `error` on a recoverable failure).
```

`deriveMessages()` 随后产出 `[summary_as_user_message, ...retained_entries]`。复用 `user/message` 是诚实的而非变通：摘要确实*是* user 角色的上下文。
```

**File:** packages/compaction/compaction-basic/src/summarizer.ts (L31-66)
```typescript
const COMPACTION_INSTRUCTION = [
  'You are now acting as a compaction engine for this AI coding assistant. Condense the conversation ABOVE into a structured checkpoint that lets another model resume the work with no loss of essential context.',
  '',
  'Output EXACTLY the Markdown structure below: keep every section, in order. Use terse bullets, not prose paragraphs. Write "(none)" for an empty section — never drop a section.',
  '',
  '## Primary Request and Intent',
  "- [the user's original and evolving goals; quote verbatim where the exact wording matters]",
  '',
  '## Key Technical Concepts',
  '- [technologies, frameworks, patterns, and conventions in play]',
  '',
  '## Files and Code',
  '- [exact path: why it matters, key changes or snippets]',
  '',
  '## Errors and Fixes',
  '- [error: how it was resolved, plus any related user feedback]',
  '',
  '## Pending Jobs',
  '- [explicitly requested work not yet completed]',
  '',
  '## Current Work',
  '- [precisely what was in progress at this checkpoint]',
  '',
  '## Next Step',
  '- [the single next action, directly in line with the most recent request, or "(none)"]',
  '',
  '## Critical Context',
  '- [decisions and their rationale, constraints, user preferences, open questions, data needed to continue]',
  '',
  'Rules:',
  '- Write concise English engineering prose. Preserve exact file paths, commands, error strings, identifiers, numeric values, function signatures, and syntax fragments.',
  '- Capture user feedback and explicit instructions faithfully, especially corrections.',
  '- Do NOT mention this summarization request or that the context was compacted.',
  '- Output only the checkpoint text: do not call any tool or take any other action.',
  `- If the conversation already contains a ${SUMMARY_OPEN_TAG} block, it is a PRIOR checkpoint. Do not copy it forward verbatim: preserve still-true facts, drop stale ones, and merge newer information into a single consolidated summary under the same structure.`,
].join('\n')
```

**File:** .agents/notes/implemented/bug-fix/2026-07-29-human-transcript-append-origin.md (L9-15)
```markdown
The terminal and the host history gateway both treated the model-visible surface as the human transcript. A successful compaction replaces a surface range with one checkpoint node, so the moment that replacement landed the terminal dropped every message it shadowed — conversation the user had already read — and re-ran that destructive rebuild on any later replacement. The same confusion reached pagination: `maxMessages` counted every `user/message` and `assistant/message` in the window, so a model-only replacement copy consumed a page slot the human never filled, and the cut could land between a compaction's log-only `compaction/summary` event and the replacement that cites it.

Nothing was lost from the log. `Session.events` still held every original message and full tool result; the surface only decides what the model is sent next. The defect was entirely in the projection.

## Decision

Model and human projections are separate, and the event's own marker decides which one an event belongs to. `dsh-session` exports the marker split `isAppendSurfaceEvent(event)` and `isReplacementSurfaceEvent(event)` over the two `SurfaceOp` variants, from the browser-safe `surface` module. Append-origin events are the durable source for a transcript; replacement copies stay model-only. Everything that must send exactly what the model sees — `deriveMessages`, token accounting, the compaction backends, tool pairing, injected-context liveness, cross-session reference projection — keeps reading `session.surface`.
```
