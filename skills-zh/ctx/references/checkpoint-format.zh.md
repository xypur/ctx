# 检查点格式

会话检查点的正文骨架与 front matter 模式。
真源：`docs/ctx-understanding.md` §7–§8。目标：一次压缩几十行写完；空小节直接省略；绝不为填模板而注水。

## Front matter

每个正典检查点的必备 YAML 头：

```yaml
---
created: 2026-08-27 09:41 +08:00
updated: 2026-08-27 14:02 +08:00
tags: []                       # 仅受控词表子集；允许 []
status: active                 # active | superseded | archived
thread: login-session          # 分组相关记录的稳定 kebab-case slug
prev: null                     # 上一 head 的相对路径，或 null
head: true
next: wire refresh redirect    # 可选，一行的下一步行动
---
```

字段规则：

| 字段 | 规则 |
|---|---|
| created | 由 ctx-create 设置一次，此后不变（append 不改） |
| updated | 每次 append 刷新 |
| tags | 只取受控词表值；可多选 |
| status | 状态机：active → superseded → archived |
| thread | 跨会话分组同一任务的历史 |
| prev | 同线程上一 head，或 null |
| head | 本文档是线程最新活动记录时才为 true |

受控标签词表：

| 标签 | 含义 |
|---|---|
| feature | 新增用户或模型可见能力 |
| bug-fix | 修复缺陷、回归或缺失行为 |
| architecture | 代码结构、数据模型、契约或不变量决策 |
| process | 工作流、政策、工具和维护规则 |
| simplification | 有意减少代码、行为或表面复杂度 |
| testing | 测试基础设施、策略和验证设计 |

新增标签必须先修订 cache-contract 规格——禁止临时造词。

## 正文骨架

```markdown
# Context Checkpoint: <title>

## Problem

问题和目标，两三句话说清楚。

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|

## Decision

做了什么决策、为什么、哪些文件/行为变化了
（关键路径内联列出；不设 Created/Modified 子清单）。

## Consequences

收益、代价和取舍，几行即可。

## Verification

如何验证，结果是什么。

## Update Log

- 2026-08-27 14:02: 追加了什么变化。
```

写作规则：

1. 有内容才保留小节；空小节整个省略。
2. 关键技术上下文只在确实有助于理解时写入 Problem 或 Decision，不设独立章节。
3. 变更以内联路径清单并入 Decision。

### 需求状态

每行需求恰有一个状态：

- `solved` — 已完成且有证据支撑；
- `partial` — 重要部分仍未完成；
- `unresolved` — 尚未处理；
- `deferred` — 明确延期；
- `rejected` — 经过考虑后拒绝，并记录理由。

绝不因为计划写完就把工作标成 solved。

### 验证诚实性

- 只有真实命令输出或评审证据才可写 `passed` / `failed`；
- 否则写 `Not run`；
- “应该可以”永远不是已验证。
