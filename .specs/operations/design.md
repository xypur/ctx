# Design Document

## Overview

operations 把 cache-contract 的静态契约激活成行为。唯一产出物是 `skills/ctx/SKILL.md`（含 front matter name/description + 正文操作流）。设计重点是把每次压缩归入清晰的动词入口，并强制渐进式披露的最大信息量路径。

## Architecture

```text
SKILL.md
├── YAML: name: ctx, description(触发面)
├── 总览表: 五操作一行式区分
├── create 流程 (R2) ── 引用 references/checkpoint-format.md
├── append 流程 (R3)
├── resume 流程 (R5) ── L1→L2→L3
├── archive 流程 (R6)
└── 共通: 意图询问(R4)、历史保留(R7)
```

## Components / Composables

create 与 append 共用“定位 thread head → 校验状态 → 变更产物 → 回写索引”的四拍骨架，差别仅在是否新建文件。伪代码：

```text
resolve_head(root_index, thread):
    return root_index.active_thread[thread]   # null 表示无历史
```

## Interfaces & Data Models

SKILL.md front matter 示例：

```yaml
name: ctx
description: >-
  Save / restore compressed session context as decision-oriented project
  memory. Use when compacting a conversation ("save this context"),
  resuming prior work, or maintaining .agents/context/.
```

## Key Decisions

### Decision 1: create/append 对立命名替代 save/update

**Context:** save/update 无法表达“新文件 vs 续写”，曾长期混淆。

**Options Considered:**
- **Option A: 保留 save/update + 内部分流** — 少一个词，但引入自动猜测意图，违反诚实原则
- **Option B: checkpoint/append** — 心智模型好但不对称
- **Option C: create/append** — 动作目的地一一对应（新文件 / 现有 head）

**Decision:** Option C。Rationale: 两个动词落在同一语义轴上互为否定，用户输入映射无需判断逻辑即无歧义；意图不明时只剩“问用户”一种合法路径。

### Decision 2: 披露层级收缩为三层并默认英文单语

**Context:** 分类目录删除后原 L2（分类索引）消失。

**Options Considered:**
- **Option A: 保留 L1–L4 四层** — 多一层无效跳转
- **Option B: L1 根索引 → L2 会话文档 → L3 prev+归档** 

**Decision:** Option B。Rationale: 文档集合扁平化后两级导航已达任意文件；“按需读历史”降级为 L3 与默认只读英文共同控制 token 开销。

### Decision 3: 状态机集中在 front matter，操作只迁移不复制

**Context:** superseded/archived/head 曾散落在正文标题里导致双处维护。

**Options Considered:**
- 正文段落携带状态（不可机检）
- **front matter 单一真源，五操作只是状态的合法迁移函数**

**Decision:** 后者。Rationale: `active→superseded→archived` 加 head 布尔位构成可穷举的小状态机，doctor 可整体校验；操作规则只需声明合法迁移边。

## Error Handling

| Scenario | Handling |
|----------|----------|
| “保存一下”无法判定 create/append | 按 R4 必须询问，示例话术写入 SKILL.md |
| create 时发现同名文件冲突 | 按 cache-contract 命名规则加 -NN 序号后缀继续 |
| append 时定位不到 head | 视为错误状态提示运行 `ctx` 查看，不擅自新建 |
| archive 时仍被 active 记录引用 | 拒绝执行并输出阻塞原因 |

## Correctness Properties

*A property is a formal statement about what the system should do.*

### Property 1: created 不可变性

*For any* 经历过任意次 append 的会话文档，其文件名与 `created` 字段与其首次 create 产物完全一致，`updated` ≥ `created`。

**Validates: Requirements 3.1**

### Property 2: thread 内 head 唯一性

*For any* 时刻，同一 `thread` 至多一个文档满足 `head=true` 且该文档必为根索引活动线程小节所指向者。

**Validates: Requirements 2.1, 3.1**

### Property 3: superseded 前置条件

*For any* status 从 active 迁移到 superseded 的记录，执行时刻已存在一个承接其有效事实的新记录（prev 反向可达）。

**Validates: Requirements 2.2, 6.3**

### Property 4: 历史可达性

*For any* 归档完成的记录，从任一 active 记录沿 prev 链或经由归档索引至少存在一条文本路径到达它。

**Validates: Requirements 6.2, 7.1**

### Property 5: 模糊意图必问性

*For any* 无法从用户输入唯一确定 create 或 append 的保存请求，流程产物中不会出现未经确认的分发结果。

**Validates: Requirements 4.1, 4.2**
