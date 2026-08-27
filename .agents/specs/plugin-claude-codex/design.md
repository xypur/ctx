# Design Document

## Overview

两个宿主共享一份 hook 脚本与一组命令要点（ponytail 的 claude-codex 同构模式）：清单文件只做指针，行为全部来自 skills/ctx 与 hooks/。

## Architecture

```text
.codex-plugin/plugin.json  ┐
.claude-plugin/plugin.json ├→ 指向 skills/ctx、hooks/、commands/
hooks/ctx-activate.js      ← SessionStart：检测根索引 → 注入提示
hooks/ctx-hint.js          ← 共享提示常量（extension-pi-opencode 先行交付，此处 import）
commands/ctx*.toml         ← Codex 命令
commands/ctx*.md           ← Claude Code 命令
```

数据流：SessionStart → ctx-activate.js 检测 `<cwd>/.agents/context/index.md` → 存在则输出 additionalContext → 会话携带提示；命令调用 → 展开薄模板 → Agent 读 SKILL.md 执行操作。

## Interfaces & Data Models

hook stdout 协议（Claude Code SessionStart）：

```json
{ "hookSpecificOutput": { "hookEventName": "SessionStart",
  "additionalContext": "ctx: context cache found at <path>/.agents/context/. To resume prior work, read .agents/context/index.md first." } }
```

命令模板形态（薄命令）：

```md
---
description: ...
---
Read skills/ctx/SKILL.md and execute its ctx-resume operation with: $ARGUMENTS
```

激活提示常量位于 `hooks/ctx-hint.js`（由先行模块 extension-pi-opencode 交付），ctx-activate.js import 之，自身只负责宿主协议与存在性检测。

## Key Decisions

### Decision 1: 检测信号 = 根索引存在性

**Context:** hook 无法可靠判断「是否有可恢复内容」。

**Options Considered:**
- **Option A: 读索引内容判断是否非空** — Pros: 更精确 / Cons: hook 与缓存格式耦合，违反薄适配。Effort: medium
- **Option B: 仅检测存在性** — Pros: 零耦合，与 init 产出物一致（init 生成即合法）。Effort: low

**Decision:** Option B。

**Rationale:** init 骨架本身就是「空而健康」状态（tooling Requirement 5.1），存在即有读的价值；内容判断留给 ctx-resume 的渐进披露。

### Decision 2: 注入走 additionalContext 结构化通道

**Decision:** 按宿主 hook 协议输出结构化 additionalContext（实现方式同构 ponytail hooks/ponytail-activate.js），不用 stderr/exit code 旁路。

**Rationale:** 结构化通道是宿主支持的正规注入路径；stderr 语义是报错，会误导用户。

### Decision 3: 命令正文单一真源

**Options Considered:**
- **Option A: 每宿主独立撰写命令正文** — Cons: 五命令 × N 宿主易漂移
- **Option B: 两宿主形态从同一要点派生，check-adapters 校验操作名集合一致** — Pros: 漂移可机械检出。Effort: low

**Decision:** Option B。

**Rationale:** 五命令正文各只有一句话，复制成本本就低；要点是「读 SKILL.md + 操作名 + 参数」，集合一致性可被校验器断言。

## Error Handling

| Scenario | Handling |
|----------|----------|
| node 不可用 | 宿主 hook 调用失败但不中断会话（静默降级） |
| cwd 无缓存 | 静默，无输出 |
| 命令参数为空 | 空参数透传，由 SKILL.md 的「Ask when ambiguous」规则接管 |

## Correctness Properties

### Property 1: 无缓存零信号

*For any* 不含 `.agents/context/index.md` 的目录，hook 输出为空且文件系统无变化。

**Validates: Requirements 2.2, 2.3**

### Property 2: 命令不携带规则正文

*For any* 命令文件，其正文不包含操作流程步骤（仅含指向 SKILL.md 的读取指令与操作名）。

**Validates: Requirements 3.2**
