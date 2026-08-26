# ctx：AI 会话上下文压缩与缓存——理解与设计确认

> 本文只记录当前对需求和设计的理解，不代表已经开始实现 skill。

## 1. 项目目标

本项目最终要提供一个名为 `ctx` 的 AI skill，用于把 AI 会话中的重要上下文压缩为可持久化、可检索、可恢复的项目记忆。

它的目标不是保存一份普通的会话摘要，而是让未来的 AI Agent 能够理解项目之前发生过什么，包括：

- 用户提出了哪些要求；
- 当时需要解决什么问题；
- 哪些要求已经解决；
- 哪些要求部分解决、未解决、延期或拒绝；
- 做过哪些决策，以及为什么选择这些决策；
- 修改过哪些文件、代码或行为；
- 这些决策和修改带来了哪些后果与取舍；
- 做过哪些验证，验证结果是什么；
- 下一步应该从哪里继续。

因此，`ctx` 的核心产物是**面向决策的上下文记录**，而不是完整的会话转录。

## 2. 设计来源

### 2.1 Pi

参考 `references/_docs/pi-context-compression.md`，吸收以下思想：

- 使用结构化摘要，而不是保存无边界的原始会话内容；
- 新的压缩结果可以基于旧摘要进行迭代合并；
- 记录会话中的文件读取和文件修改信息；
- 在压缩时注意工具调用和工具结果之间的完整关系；
- 压缩上下文，但不意味着历史事实被删除。

### 2.2 DeepSeek Harness

参考 `references/_docs/deepseek-harness-context-compression.md` 以及其 `.agents/notes`，吸收以下思想：

- 将核心能力与宿主 Agent 的具体实现分离；
- 压缩主要改变后续 Agent 读取的上下文投影，不应该破坏历史记录；
- 使用检查点记录，而不是简单的文本拼接；
- 按 `feature`、`bug-fix` 等需求类型组织记录；
- 使用英文正典、中文镜像和 `.i18n.yaml` 配对凭据；
- 通过明确的生命周期管理记录的状态。

### 2.3 Ponytail

后续实现各 AI Agent CLI 的指令时，参考 `references/ponytail/docs/agent-portability.md` 的 Adapter Rule：

> 核心行为只保留在共享 skill 中，各宿主适配器保持薄，只负责提供入口，不复制上下文缓存规则。

Ponytail 适配层属于后续阶段，本阶段不实现。

## 3. Skill 与缓存目录

Skill 名称确定为：

```text
ctx
```

缓存数据根目录确定为：

```text
.agents/context/
```

Skill 本身和缓存数据分开：

```text
.agents/
├── skills/ctx/       # ctx skill 的规则、参考文档和维护脚本
└── context/          # 项目级 AI 上下文缓存
```

`.agents/context/` 中保存的是项目持久化记忆，原则上应当纳入版本控制，而不是当作临时文件处理。

## 4. 目录分类方式

上下文缓存不按照年份或月份建立目录，而是按照记录所对应的需求或决策类型分类。

```text
.agents/context/
├── index.md
├── feature/
├── bug-fix/
├── architecture/
├── process/
├── simplification/
├── testing/
└── archive/
```

分类集合借鉴 DeepSeek Harness 的 Agent Notes：

| 分类 | 含义 |
|---|---|
| `feature` | 新增用户或模型可见能力 |
| `bug-fix` | 修复缺陷、回归或缺失行为 |
| `architecture` | 保存代码结构、数据模型、契约或不变量决策 |
| `process` | 保存工作流、政策、工具和维护规则 |
| `simplification` | 有意减少代码、行为或表面复杂度 |
| `testing` | 保存测试基础设施、测试策略和验证设计 |

每条缓存记录只有一个主分类。若记录涉及多个领域，应选择最主要的分类，并通过交叉链接或标签关联其他领域，而不是复制同一文件。

### 为什么不按日期分目录

日期仍然重要，但日期用于文件名排序，而不是目录分类。

这样可以同时满足：

- 通过目录按语义寻找历史，例如快速查看所有 bug-fix；
- 通过文件名前缀保持时间顺序；
- 避免同时维护日期目录和需求类型目录两套层级；
- 让未来 Agent 更容易根据当前问题找到相关历史。

## 5. 文件命名

英文缓存文件使用以下命名格式：

```text
YYYY-MM-DD-HHMM-<kebab-slug>.md
```

例如：

```text
2026-08-26-2115-login-session-fix.md
```

文件名中的日期和时间承担以下职责：

- 保留记录创建时间；
- 保证同一天可以创建多个记录；
- 使字典序基本等于创建时间顺序；
- 避免纯日期文件名在同一天内发生冲突。

如果同一分钟内仍然发生冲突，应增加确定性的序号后缀，例如：

```text
2026-08-26-2115-login-session-fix-02.md
```

## 6. 索引设计

### 6.1 根索引

缓存根目录必须有：

```text
.agents/context/index.md
```

根索引是 AI 恢复上下文时的第一入口。它不是简单的文件目录，而是所有上下文记录的轻量决策摘要。

根索引至少需要包含：

1. 各需求类型索引的链接；
2. 当前活动线程及其 head；
3. 未解决和延期的用户要求；
4. 活动缓存记录；
5. 被取代和已归档记录；
6. 每个缓存文件解决了什么问题的摘要。

### 6.2 分类索引

每个需求类型目录也有一个 `index.md`：

```text
.agents/context/feature/index.md
.agents/context/bug-fix/index.md
.agents/context/architecture/index.md
.agents/context/process/index.md
.agents/context/simplification/index.md
.agents/context/testing/index.md
```

分类索引只列出该分类下的记录，用于在根索引筛选出候选范围后进一步缩小读取范围。

### 6.3 不设置月度索引

最初按日期分目录时，可以考虑“根索引 + 每月索引”。但当前已经改为按需求类型分类，因此不再单独维护月度索引：

```text
根索引 → 分类索引 → 具体缓存文件
```

日期由文件名负责，语义由目录负责，避免两个维度重复维护。

## 7. Index 中必须记录的内容

Index 中每个缓存文件的记录不能只写标题和链接，而应该回答以下问题：

| 字段 | 要回答的问题 |
|---|---|
| Problem | 这条记录解决了什么问题？ |
| User requirements | 用户提出了哪些要求？ |
| Resolved | 哪些要求已经解决？ |
| Unresolved / deferred | 哪些要求仍未解决、被延期或受阻？ |
| Decision / changes | 做了什么决策，修改了什么？ |
| Consequences | 产生了哪些收益、代价和取舍？ |
| Verification | 如何验证，结果是什么？ |
| Status / head | 这条记录是否仍然是活动 head？ |
| Next | 未来 Agent 的第一步是什么？ |

根索引中的内容应当保持紧凑，使用一行或几行摘要；详细理由、完整文件列表和验证输出放在对应的缓存文件中。

根索引的作用是帮助 AI 判断“应该打开哪条记录”，而不是替代完整记录。

## 8. 完整缓存文件格式

每个英文缓存文件都应当是一个结构化检查点，至少包含以下内容：

```markdown
# Context Checkpoint: <title>

- Created: YYYY-MM-DD HH:MM <timezone>
- Updated: YYYY-MM-DD HH:MM <timezone>
- Classification: feature | bug-fix | architecture | process | simplification | testing
- Status: active | superseded | archived
- Thread: <stable-thread-slug>
- Prev: <previous-record-or-none>
- Head: true | false

## Problem

## Goal

## User Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|

## Key Technical Context

## Decision

## Changes

### Created

### Modified

### Read / Relevant

### Deleted

## Consequences

### Benefits

### Costs and Trade-offs

## Verification

## Current Status

## Next Steps

## Critical Context

## Update Log
```

### 需求状态

每一项用户要求都要明确标记状态：

- `solved`：已解决，并且有证据支持；
- `partial`：部分解决，仍有重要内容未完成；
- `unresolved`：仍未解决；
- `deferred`：明确延期；
- `rejected`：经过考虑后明确拒绝，并记录理由。

不能因为“写完了计划”就把实际功能标记为已完成。

### 验证状态

验证结果必须与意图、推测或信心区分开：

- 有实际命令输出或审查证据时，记录 `passed` 或 `failed`；
- 没有执行验证时，记录 `Not run`；
- 不能把“应该可以”记录成“已验证”。

## 9. 同一会话的多次压缩

同一个会话或同一个工作线程可以多次创建上下文缓存，但必须由不同操作明确区分“新增”和“追加”。

### `ctx-save`：新增缓存

`ctx-save` 创建新的缓存文件：

1. 读取根索引；
2. 确定线程和主分类；
3. 创建新的日期时间前缀文件；
4. 用 `Prev:` 链接上一个线程 head；
5. 创建英文文件、中文镜像和 `.i18n.yaml`；
6. 更新分类索引和根索引；
7. 将新文件设置为当前 head。

旧记录不能直接删除。只有在新记录完整承接旧记录的有效事实后，旧记录才可以标记为 `superseded`，之后仍然保留链接。

### `ctx-update`：追加到已有缓存

`ctx-update` 不创建新的缓存文件，而是更新现有线程 head：

1. 读取根索引并定位准确的 head；
2. 保持文件名和 `Created` 不变；
3. 更新 `Updated`；
4. 合并 Problem、User Requirements、Decision、Changes、Verification 等当前章节；
5. 在 `Update Log` 中追加本次变化；
6. 同步中文镜像、`.i18n.yaml`、分类索引和根索引。

`ctx-update` 是“结构化合并 + 追加更新日志”，不是把第二份完整摘要随意粘到文件末尾。

如果用户只说“保存一下”，无法判断是新增还是追加，应先询问用户，而不是由 AI 默默选择。

## 10. 双语文档

正式的双语记录采用三件套：

```text
2026-08-26-2115-login-session-fix.md
2026-08-26-2115-login-session-fix.zh.md
2026-08-26-2115-login-session-fix.i18n.yaml
```

规则如下：

- `.md` 是英文正典，也是 AI 默认读取的版本；
- `.zh.md` 是中文镜像，供人类阅读或明确的中文请求使用；
- `.i18n.yaml` 记录两侧最近一次确认一致时的 git blob hash；
- 中文镜像不作为独立缓存记录列入 index；
- 编辑任一语言版本后，应先同步另一侧，再更新 `.i18n.yaml`。

AI 默认恢复路径只读取英文：

```text
.agents/context/index.md
→ 相关分类 index.md
→ 选中的英文缓存文件
→ 必要时沿 Prev 读取历史
```

## 11. 渐进式披露

`ctx` 使用三层上下文披露：

| 层级 | 内容 | 默认行为 |
|---|---|---|
| L1 | 根 `index.md` | 每次恢复上下文时首先读取 |
| L2 | 分类 `index.md` 与索引摘要 | 只有需要缩小候选范围时读取 |
| L3 | 完整英文缓存文件 | 只读取与当前任务相关的记录 |

历史前置记录只有在以下情况下才继续读取：

- 当前记录缺少必要事实；
- 需要检查决策是如何演变的；
- 需要确认某个用户要求过去的解决状态。

默认不读取所有缓存文件，也不读取中文镜像。

## 12. 操作命名

核心操作词汇确定为：

| 操作 | 含义 |
|---|---|
| `ctx` | 查看缓存状态和根索引摘要 |
| `ctx-save` | 新增缓存文件 |
| `ctx-update` | 追加到已有缓存文件 |
| `ctx-resume` | 从缓存恢复此前工作 |
| `ctx-archive` | 归档被取代的完整记录 |

后续各 AI Agent CLI 可以分别映射为：

```text
/ctx
/ctx-save
/ctx-update
/ctx-resume
/ctx-archive
```

这些 CLI 指令属于后续适配层。它们只负责提供宿主入口，核心规则仍由 `ctx` skill 统一维护。

## 13. 历史保留原则

`ctx` 遵循以下原则：

> 新的摘要可以替代默认读取路径，但不能静默抹掉历史事实、决策理由和验证记录。

因此：

- 新增记录通过 `Prev:` 形成历史链；
- 更新已有记录时使用 `Update Log` 保存变化；
- 被取代记录标记为 `superseded`，而不是立即删除；
- 归档时移动完整的 `.md`、`.zh.md` 和 `.i18n.yaml` 三件套；
- 移动记录后必须修复所有索引链接和 `Prev:` 链接。

## 14. 当前阶段边界

当前阶段只需要确定并实现：

- `ctx` skill 的核心工作流；
- `.agents/context/` 的缓存布局；
- 根索引和分类索引；
- 结构化检查点格式；
- `ctx-save`、`ctx-update`、`ctx-resume` 等操作规则；
- 英文正典、中文镜像和 `.i18n.yaml` 凭据；
- 必要的确定性维护与验证脚本。

当前阶段暂不实现：

- 各 AI Agent CLI 的具体插件、hook 或 slash command；
- 针对某一个 Agent 的专属上下文注入逻辑；
- 替代 Pi、DeepSeek Harness 等运行时自身的原生 token compaction；
- 自动猜测用户意图、自动选择 `ctx-save` 或 `ctx-update`。

## 15. 一句话总结

> `ctx` 按需求类型组织上下文历史，按文件名保留时间顺序；根索引和分类索引负责渐进式导航，完整双语检查点负责保存用户要求、问题、决策、修改、后果和验证证据，使未来的 AI 能够在不读取全部历史的情况下准确继续工作。
