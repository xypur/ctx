# 本次会话总结：ctx 上下文压缩与缓存设计

- 日期：2026-08-26
- 主题：AI 会话上下文压缩、缓存、索引与后续 CLI 适配设计
- 当前状态：完成需求理解和设计文档，尚未实现 `ctx` skill

## 1. 初始目标

本次会话围绕以下目标展开：

1. 参考 `references/deepseek-harness`、`references/pi` 及 `references/_docs` 中的上下文压缩分析，在当前项目创建一个 AI 会话上下文压缩与缓存 skill；
2. 后续参考 `references/ponytail`，为该 skill 补充不同 AI Agent CLI 工具的指令和适配层；
3. 采用类似 `references/deepseek-harness/.agents/notes` 的文档形式；
4. 支持中英文双语文档，但 AI 默认只读取英文版本；
5. 采用渐进式披露方式管理会话上下文，包括根索引和按需加载的详细缓存文件；
6. 通过日期前缀保证缓存文件的时间顺序。

## 2. 参考项目与得到的启发

### 2.1 Pi

参考文档：

```text
references/_docs/pi-context-compression.md
```

主要借鉴点：

- 使用结构化摘要，而不是无边界地保留完整会话转录；
- 通过保留近期消息、压缩较早历史来降低上下文压力；
- 切割点不能破坏 tool-call 与 tool-result 的配对关系；
- 新的压缩摘要可以基于上一次摘要进行迭代合并；
- 记录读取文件和修改文件等 file operations；
- 压缩的是模型后续看到的上下文，完整历史仍然保留；
- 摘要应包含目标、约束、进展、关键决策、下一步和关键上下文。

### 2.2 DeepSeek Harness

参考文档：

```text
references/_docs/deepseek-harness-context-compression.md
references/deepseek-harness/.agents/notes/
```

主要借鉴点：

- 将压缩能力的契约与具体实现分离，形成 capability seam；
- 压缩只改变后续模型使用的上下文投影，不应删除历史事实；
- 使用结构化 checkpoint，而不是简单拼接摘要；
- 记录 Primary Request and Intent、Key Technical Concepts、Files and Code、Errors and Fixes、Pending Jobs、Current Work、Next Step、Critical Context 等内容；
- Agent Notes 按生命周期和需求类型分类；
- 双语文档使用英文正典、中文镜像和 `.i18n.yaml` 配对凭据；
- 通过 `Prev:`、状态和归档机制保留决策演进过程。

### 2.3 Ponytail

参考文档：

```text
references/ponytail/docs/agent-portability.md
```

主要借鉴点：

- 核心行为只维护在共享 skill 中；
- 各 AI Agent CLI 的适配器保持薄；
- Claude Code、Codex、OpenCode、Gemini CLI、Cursor、Windsurf、Cline、GitHub Copilot、pi 等工具只需要各自的入口、hook 或规则适配；
- 后续适配器不能复制核心上下文缓存规则。

## 3. 已确定的总体设计

### 3.1 Skill 名称

Skill 名称确定为：

```text
ctx
```

该名称短、易记，并且与当前项目名称一致。触发准确性由 skill 的完整 `description` 负责，而不是仅依赖 `ctx` 这个短名称。

### 3.2 缓存根目录

缓存数据根目录确定为：

```text
.agents/context/
```

Skill 本身与缓存数据分开：

```text
.agents/
├── skills/ctx/       # skill 规则、参考文档和维护脚本
└── context/          # 项目级 AI 上下文缓存
```

缓存数据属于项目的持久化记忆，原则上应当纳入版本控制，不应被视为临时文件。

## 4. 目录分类方案

最初曾讨论按年份和月份划分目录，例如：

```text
context/2026/08/
```

之后结合 DeepSeek Harness Agent Notes 的经验，决定按照需求或决策类型进行分类，而不是按照日期划分目录。

最终分类为：

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

分类含义：

| 分类 | 含义 |
|---|---|
| `feature` | 新增用户或模型可见能力 |
| `bug-fix` | 修复缺陷、回归或缺失行为 |
| `architecture` | 保存代码结构、数据模型、契约或不变量决策 |
| `process` | 保存工作流、政策、工具和维护规则 |
| `simplification` | 有意减少代码、行为或表面复杂度 |
| `testing` | 保存测试基础设施、测试策略和验证设计 |

每条缓存记录只有一个主分类。跨分类内容通过交叉链接或标签关联，不复制同一份记录。

### 不按日期建立目录的原因

- 需求类型比日期更适合语义检索；
- AI 可以直接查找所有 `bug-fix` 或 `architecture` 历史；
- 日期仍可保留在文件名前缀中，因此时间顺序不会丢失；
- 避免同时维护日期目录和分类目录两套组织方式；
- 不需要根索引、月度索引和分类索引重复维护相同信息。

## 5. 文件命名方案

英文缓存文件使用：

```text
YYYY-MM-DD-HHMM-<kebab-slug>.md
```

示例：

```text
2026-08-26-2115-login-session-fix.md
```

虽然曾讨论过只使用日期，但最终理解保留 `HHMM` 更稳妥，原因是：

- 同一天可能多次压缩同一会话；
- 纯日期文件名容易冲突；
- 时间前缀可以直接提供更细粒度的排序；
- 不需要使用含义不明确的 `-2`、`-3` 作为常规区分方式。

如果同一分钟仍然发生冲突，可以增加确定性序号：

```text
2026-08-26-2115-login-session-fix-02.md
```

## 6. 索引设计

### 6.1 根索引

必须存在：

```text
.agents/context/index.md
```

根索引是 AI 恢复上下文时的第一入口。它不是简单的文件列表，而是所有缓存记录的轻量决策摘要。

### 6.2 分类索引

每个分类目录都需要一个索引：

```text
.agents/context/feature/index.md
.agents/context/bug-fix/index.md
.agents/context/architecture/index.md
.agents/context/process/index.md
.agents/context/simplification/index.md
.agents/context/testing/index.md
```

归档区域还需要一个归档索引：

```text
.agents/context/archive/index.md
```

### 6.3 不设置月度索引

在采用日期目录时，根索引加月度索引是合理的；但在最终改为需求类型目录后，索引层级应调整为：

```text
根索引 → 分类索引 → 具体缓存文件
```

不再为每个月份单独创建索引。日期由文件名负责，分类目录负责语义检索。

### 6.4 Index 必须描述的问题

Index 中每个缓存文件都必须说明：

| 字段 | 要表达的内容 |
|---|---|
| Problem | 这条记录解决了什么问题 |
| User requirements | 用户提出了哪些要求 |
| Resolved | 哪些要求已经解决 |
| Unresolved / deferred | 哪些要求未解决、延期或受阻 |
| Decision / changes | 做了什么决策、修改了什么 |
| Consequences | 产生了哪些收益、代价和取舍 |
| Verification | 如何验证以及验证结果 |
| Status / head | 是否仍是活动记录或线程 head |
| Next | 未来 Agent 的第一步行动 |

Index 的作用是帮助 AI 判断“应该读取哪条记录”，而不是替代完整缓存文件。

## 7. 完整缓存文件结构

完整英文缓存文件应当是面向决策的 checkpoint，建议包含：

```markdown
# Context Checkpoint: <title>

- Created:
- Updated:
- Classification:
- Status:
- Thread:
- Prev:
- Head:

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

### 用户要求状态

每个重要用户要求都必须明确标记为：

- `solved`：已经解决，并且有证据；
- `partial`：部分解决，仍有重要内容；
- `unresolved`：仍未解决；
- `deferred`：明确延期；
- `rejected`：经过考虑后拒绝，并记录理由。

不能仅因为写完了计划，就把实际功能标记为已完成。

### 验证记录

验证必须与计划、推测和信心区分：

- 有实际命令输出或审查证据时记录 `passed` 或 `failed`；
- 没有运行验证时记录 `Not run`；
- 不能把“理论上应该可以”写成“已验证”。

## 8. 同一会话的多次压缩

同一个会话或工作线程可以产生多份缓存，但必须明确区分新增和追加。

### `ctx-save`

`ctx-save` 创建新的缓存文件：

1. 读取根索引；
2. 确定线程和主分类；
3. 创建新的日期时间前缀文件；
4. 用 `Prev:` 链接前一个线程 head；
5. 创建英文正典、中文镜像和 `.i18n.yaml`；
6. 更新分类索引和根索引；
7. 将新文件设置为当前 head。

旧记录不能直接删除。只有新记录完整承接旧记录中仍有效的事实后，旧记录才能标记为 `superseded`。

### `ctx-update`

`ctx-update` 更新已有缓存文件，不创建新文件：

1. 读取根索引并定位准确的线程 head；
2. 保持文件名和 `Created` 不变；
3. 更新 `Updated`；
4. 合并当前的 Problem、User Requirements、Decision、Changes、Verification 等章节；
5. 在 `Update Log` 追加本次变化；
6. 同步中文镜像、`.i18n.yaml`、分类索引和根索引。

`ctx-update` 是“结构化合并 + 追加更新日志”，不是随意粘贴第二份完整摘要。

如果用户只说“保存一下”，无法判断是新增还是追加，AI 必须先询问。

## 9. 双语文档规则

每个正式双语缓存记录采用三件套：

```text
2026-08-26-2115-login-session-fix.md
2026-08-26-2115-login-session-fix.zh.md
2026-08-26-2115-login-session-fix.i18n.yaml
```

规则如下：

- `.md` 是英文正典，也是 AI 默认读取版本；
- `.zh.md` 是中文镜像，供人类阅读或明确的中文请求使用；
- `.i18n.yaml` 记录两侧最近一次确认一致时的 git blob hash；
- 中文镜像不作为独立记录列入 index；
- 编辑任一语言版本后，应先同步另一侧，再更新 `.i18n.yaml`。

AI 默认读取路径为：

```text
.agents/context/index.md
→ 相关分类 index.md
→ 选中的英文缓存文件
→ 必要时沿 Prev 读取历史
```

默认不读取中文镜像，也不扫描所有历史缓存。

## 10. 渐进式披露层级

| 层级 | 内容 | 使用时机 |
|---|---|---|
| L1 | 根 `index.md` | 每次恢复上下文时首先读取 |
| L2 | 分类 `index.md` | 需要缩小候选范围时读取 |
| L3 | 完整英文缓存文件 | 选中相关记录后读取 |
| L4 | `Prev` 历史记录 | 当前记录缺少事实或需要历史理由时读取 |

该机制的目标是让 AI 能够理解历史，而不必为每次任务读取全部会话记录。

## 11. 指令命名

核心操作词汇确定为：

| 指令 | 含义 |
|---|---|
| `ctx` | 查看缓存状态和根索引摘要 |
| `ctx-save` | 新增缓存文件 |
| `ctx-update` | 追加到已有缓存文件 |
| `ctx-resume` | 从缓存恢复之前的工作 |
| `ctx-archive` | 归档已被取代的完整记录 |

后续 CLI 适配层可以映射为：

```text
/ctx
/ctx-save
/ctx-update
/ctx-resume
/ctx-archive
```

核心 skill 不应包含某个宿主专属的实现逻辑。

## 12. 历史保留原则

本次设计反复确认的核心原则是：

> 新摘要可以替代默认读取路径，但不能静默抹掉历史事实、决策理由和验证记录。

因此：

- 新增缓存通过 `Prev:` 形成历史链；
- 更新已有缓存通过 `Update Log` 保存演进过程；
- 被取代的记录标记为 `superseded`，而不是直接删除；
- 归档时移动完整的 `.md`、`.zh.md` 和 `.i18n.yaml` 三件套；
- 移动后必须修复索引链接和 `Prev:` 链接。

## 13. 本次会话中的误执行与回滚

在讨论阶段，曾因为误解用户连续发送的“go/继续”，提前开始实现，创建了以下内容：

- `.agents/skills/ctx/`；
- `.agents/context/`；
- `.specs/`；
- `docs/ctx-understanding.md` 的早期版本；
- 对 `README.md` 的临时修改以及其他配套文件。

用户明确指出尚未授权执行后，立即停止操作，并按要求完成回滚：

- 删除 `.agents/skills/ctx/`；
- 删除 `.agents/context/`；
- 删除 `.specs/`；
- 删除当时临时创建的配套文件；
- 将原有空的 `README.md` 恢复为空；
- 保留原本已有的 `.agents/skills/skill-dev` 和 `references/` 内容。

该次误执行的教训是：在用户要求“确认”或“继续讨论”时，不能将模糊的“go/继续”自动解释为开始修改文件；后续应等待明确的实现授权。

## 14. 本次实际产出

### 14.1 理解文档

用户随后明确要求将设计理解输出为 Markdown 文档，创建了：

```text
docs/ctx-understanding.md
```

该文档记录了：

- 项目目标；
- Pi、DeepSeek Harness 和 Ponytail 的参考点；
- `ctx` 命名；
- `.agents/context/` 缓存根目录；
- 按需求类型分类；
- 根索引和分类索引；
- `ctx-save`、`ctx-update`、`ctx-resume` 等操作；
- 双语和渐进式披露规则；
- 历史保留原则；
- 当前阶段边界。

### 14.2 Git 提交

用户要求提交当前全部内容，首次提交信息为：

```text
docs: record ctx context cache design
```

用户随后指出提交信息必须使用“首字母大写的祈使句”。提交已 amend 为：

```text
Document the ctx context cache design
```

最终 commit：

```text
d852547 Document the ctx context cache design
```

### 14.3 当前总结文档

本文是本次会话之后新增的总结文档：

```text
docs/session-summary-2026-08-26-ctx-design.md
```

## 15. 当前仓库状态与未完成事项

截至本次设计讨论结束：

- `ctx` skill 尚未正式实现；
- `.agents/context/` 缓存目录尚未创建；
- 根索引和分类索引尚未创建；
- `ctx-save`、`ctx-update`、`ctx-resume` 尚未变成可执行的 skill 规则；
- 各 AI Agent CLI 的适配器和 slash command 尚未实现；
- 已完成的是需求理解文档和本次会话总结文档。

后续真正开始实现时，应先根据本文和 `docs/ctx-understanding.md` 复核设计，再明确建立 skill、缓存目录、双语文档、`.i18n.yaml` 凭据和验证脚本。

## 16. 一句话总结

本次会话最终确定：

> `ctx` 将按需求类型组织 AI 上下文历史，按文件名前缀保留时间顺序；根索引和分类索引负责渐进式导航，完整双语检查点负责记录用户要求、问题、决策、修改、后果和验证证据，使未来的 AI 能够在不读取全部历史的情况下准确继续工作。
