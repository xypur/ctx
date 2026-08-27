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
skills/               # 英文正典技能
├── ctx/
│   ├── SKILL.md      # 五操作工作流规则（Agent 读取入口）
│   ├── references/   # 缓存契约参考文档
│   └── scripts/      # init / doctor 维护脚本
skills-zh/            # 中文镜像技能，与 skills/ 同步维护
├── ctx/
│   ├── SKILL.zh.md   # 中文版文件统一带 .zh.md 后缀
│   └── references/
│       └── *.zh.md
.agents/context/      # 项目级 AI 上下文缓存（数据）
```

技能与缓存数据分离：`skills/`、`skills-zh/` 是规则本体；`.agents/context/` 只是数据。中英两份技能内容等价，英文正典优先，修改任一侧后先同步另一侧再继续；中文镜像的每个文件都以 `.zh.md` 后缀结尾以作区分；脚本只存在于 `skills/ctx/scripts/`（无需翻译）。

`.agents/context/` 中保存的是项目持久化记忆，原则上应当纳入版本控制，而不是当作临时文件处理。

## 4. 存储单位与分类标签

上下文缓存的存储单位是会话，而不是单个任务。一次压缩产生一个会话缓存文档，同一会话的后续压缩写回同一个文档。一个会话中同时包含 feature 和 bug-fix 工作时，不需要拆分存储——分类只作为元数据出现在同一份文档中。

`.agents/context/` 采用扁平布局，不建立任何分类子目录：

```text
.agents/context/
├── index.md                   # 根索引，唯一常规导航入口
├── YYYY-MM-DD-HHMM-<slug>.md  # 平铺的会话缓存文档（三件套）
└── archive/                   # 唯一子目录，存放被取代或已归档的记录
    └── index.md
```

分类借鉴 DeepSeek Harness 的 Agent Notes，保留为受控标签集，通过 YAML front matter 的 `tags` 字段表达，例如 `tags: [feature, bug-fix]`；正文章节保持全局组织，不按分类拆分小节；根索引摘要行同样携带 tags。没有合适的标签时可以留空。

| 分类 | 含义 |
|---|---|
| `feature` | 新增用户或模型可见能力 |
| `bug-fix` | 修复缺陷、回归或缺失行为 |
| `architecture` | 保存代码结构、数据模型、契约或不变量决策 |
| `process` | 保存工作流、政策、工具和维护规则 |
| `simplification` | 有意减少代码、行为或表面复杂度 |
| `testing` | 保存测试基础设施、测试策略和验证设计 |

### 为什么不以任务为单位拆分

按任务拆分会把一次会话切碎到多个文件：问题和上下文需要在多个分类文件间复制或互相引用，恢复时要先拼图，还需要同时维护会话视图和分类视图两套索引。以会话为单位后，"这次会话做了哪些事"由一份文档直接回答，"来自同一任务的历史演进"由 `Thread:` 和 `Prev:` 链回答。

### 为什么不按日期分目录

日期仍然重要，但日期用于文件名排序，而不是目录分类。

这样可以同时满足：

- 通过文件名前缀保持时间顺序；
- 避免同时维护日期目录和语义目录两套层级；
- 让未来 Agent 从根索引即可直达具体会话文档。

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

1. 当前活动线程及其 head；
2. 每个活动缓存文件的一行摘要（含 tags）；
3. 归档索引的链接。

### 6.2 归档索引

archive/ 目录维护自己的 `index.md`：

```text
.agents/context/archive/index.md
```

被取代或归档的记录从根索引移除，只在归档索引中保留一行条目，供追溯决策演变时查找。

### 6.3 不设置其他中间索引

不存在分类索引或月度索引，导航层级固定为：

```text
根索引 → 会话缓存文件 → 必要时沿 Prev 读取历史
```

日期由文件名负责，语义由 front matter 的 tags 负责，避免多个维度重复维护。

## 7. Index 中必须记录的内容

Index 中每个缓存文件的记录不能只写标题和链接，而应该回答以下问题：

| 字段 | 要回答的问题 |
|---|---|
| Problem | 这条记录解决了什么问题？ |
| Decision / changes | 做了什么决策，修改了什么？ |
| Consequences | 产生了哪些收益、代价和取舍？ |
| Verification | 如何验证，结果是什么？ |
| Tags | 会话涉及哪些分类（feature、bug-fix 等）？ |

根索引中的内容应当保持紧凑，使用一行或几行摘要；详细理由、完整文件列表和验证输出放在对应的缓存文件中。

根索引的作用是帮助 AI 判断“应该打开哪条记录”，而不是替代完整记录。

## 8. 完整缓存文件格式

缓存文件应当短而实，类似 DeepSeek Harness Agent Notes 的密度：头部用 YAML front matter 承载机器可读元数据，正文只保留几个必要小节：

```markdown
---
created: YYYY-MM-DD HH:MM <timezone>
updated: YYYY-MM-DD HH:MM <timezone>
tags: []                      # 受控标签集，可组合，可为空
status: active                # active | superseded | archived
thread: <stable-thread-slug>
prev: null                    # 上一个线程 head 的路径，无则为 null
head: true
next: <one-line-next-action>  # 可选，一行说明下一步做什么
---

# Context Checkpoint: <title>

## Problem

问题和目标，两三句话说清楚。

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|

## Decision

做了什么决策、为什么选择它，以及修改了哪些文件和行为（列出关键路径即可，不区分 created/modified/deleted 子清单）。

## Consequences

收益、代价和取舍，几行即可。

## Verification

如何验证，结果是什么。

## Update Log

- YYYY-MM-DD HH:MM：追加了什么变化。
```

写作规则：

- 正文目标是几十行讲完一次压缩，不是复刻会话全文；
- 有内容才写小节，没有就省略，不留空壳；
- 关键技术上下文只在确实影响理解时写入 Problem 或 Decision，不设独立章节；
- 不要为了填模板而展开无信息量的段落。

### 需求状态

每一项用户要求都要明确标记状态：

- `solved`：已解决，并且有证据支持；
- `partial`：部分解决，仍有重要内容未完成；
- `unresolved`：仍未解决；
- `deferred`：明确延期；
- `rejected`：经过考虑后明确拒绝，并记录理由。

不能因为“写完了计划”就把实际功能标记为已完成。

规范联动：当项目在 `.agents/specs/` 维护模块规格时，Requirements 表的 ID
直接引用其条款号（如 `cache-contract 3.4`），不重述需求文本；状态仍按上述
词表如实标注，且与 `.agents/specs/index.md` 的任务勾选保持一致——检查点只
记录会话增量，不改写规格状态。

### 验证状态

验证结果必须与意图、推测或信心区分开：

- 有实际命令输出或审查证据时，记录 `passed` 或 `failed`；
- 没有执行验证时，记录 `Not run`；
- 不能把“应该可以”记录成“已验证”。

## 9. 同一会话的多次压缩

同一个会话可以多次压缩：第一次用 `ctx-create` 开启会话缓存文档，之后每次都用 `ctx-append` 写回同一个文档。两者必须明确区分，不能混用。

### `ctx-create`：开启新会话缓存

`ctx-create` 创建新的会话缓存文档：

1. 读取根索引；
2. 确定线程 slug 和初始 tags；
3. 创建新的日期时间前缀文件及中文镜像、`.i18n.yaml`；
4. 在 front matter 中用 `prev:` 链接上一个线程 head；
5. 在根索引追加一行摘要，并将新文件设置为当前 head。

旧记录不能直接删除。只有在新记录完整承接旧记录的有效事实后，旧记录才可以把 `status` 标记为 `superseded`，之后仍然保留链接。

### `ctx-append`：续写当前会话缓存

`ctx-append` 不创建新的缓存文件，而是更新当前会话文档：

1. 读取根索引并定位当前线程 head；
2. 保持文件名和 `created` 不变；
3. 更新 `updated`，可按需补充 `tags`；
4. 合并 Problem、Requirements、Decision、Consequences、Verification 等实际存在的章节；
5. 在 `Update Log` 中追加本次变化；
6. 同步中文镜像、`.i18n.yaml` 和根索引摘要。

`ctx-append` 是“结构化合并 + 追加更新日志”，不是把第二份完整摘要随意粘到文件末尾。

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
→ 选中的英文缓存文件
→ 必要时沿 prev 读取历史
```

## 11. 渐进式披露

`ctx` 使用三层上下文披露：

| 层级 | 内容 | 默认行为 |
|---|---|---|
| L1 | 根 `index.md` | 每次恢复上下文时首先读取 |
| L2 | 完整英文会话缓存文件 | 只读取与当前任务相关的记录 |
| L3 | `prev:` 历史记录与归档索引 | 仅当前记录缺少事实或需追溯演变时读取 |

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
| `ctx-create` | 开启新的会话缓存文档 |
| `ctx-append` | 续写当前会话缓存文档 |
| `ctx-resume` | 从缓存恢复此前工作 |
| `ctx-archive` | 归档被取代的完整记录 |

后续各 AI Agent CLI 可以分别映射为：

```text
/ctx
/ctx-create
/ctx-append
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
- `.agents/context/` 的扁平缓存布局；
- 根索引和归档索引；
- 带 front matter 的结构化检查点格式；
- `ctx-create`、`ctx-append`、`ctx-resume` 等操作规则；
- 英文正典、中文镜像和 `.i18n.yaml` 凭据；
- 必要的确定性维护与验证脚本。

当前阶段暂不实现：

- 各 AI Agent CLI 的具体插件、hook 或 slash command；
- 针对某一个 Agent 的专属上下文注入逻辑；
- 替代 Pi、DeepSeek Harness 等运行时自身的原生 token compaction；
- 自动猜测用户意图、自动选择 `ctx-create` 或 `ctx-append`。

## 15. 一句话总结

> `ctx` 以会话为单位组织并平铺存放上下文历史，按文件名保留时间顺序，用 front matter 标签表达需求类型；根索引负责一行式渐进导航，完整双语检查点负责保存用户要求、问题、决策、修改、后果和验证证据，使未来的 AI 能够在不读取全部历史的情况下准确继续工作。
