# Requirements Document

## Introduction

定义 ctx skill 的五个操作（ctx / ctx-create / ctx-append / ctx-resume / ctx-archive）的完整行为规则，最终落成 `skills/ctx/SKILL.md`。行为以 cache-contract 的静态契约为前提。

## Glossary

- **head**：某 thread 当前最新的活动记录文档。
- **触发（skill）**：宿主 Agent 依据 SKILL.md description 判断何时加载本技能。

## Requirements

### Requirement 1：操作集与触发

**User Story:** 作为宿主 AI Agent，我希望在会话压缩场景准确唤起 ctx，并知道每个动词的确切含义。

#### Acceptance Criteria

1. THE SKILL.md SHALL 提供五个操作：`ctx`（查看状态）、`ctx-create`（开启新会话缓存）、`ctx-append`（续写当前会话缓存）、`ctx-resume`（恢复工作）、`ctx-archive`（归档被取代记录），并给出恰好一句话的操作区分。
2. THE SKILL.md description SHALL 覆盖“会话压缩 / 保存上下文 / 恢复上下文”等触发场景，保证短名 `ctx` 的触发准确性由 description 兜底。
3. 核心规则 SHALL 全部位于共享 SKILL.md 与 references 中，未来各宿主适配层只做入口映射、不复制规则。

### Requirement 2：ctx-create 流程

**User Story:** 作为 AI Agent，我在开启一份新会话缓存时需要一个确定性的步骤序列。

#### Acceptance Criteria

1. WHEN 执行 `ctx-create` 时，THE 系统 SHALL 按序完成：读取根索引 → 确定 thread slug 与初始 tags → 创建三件套新文件 → front matter 中 `prev:` 链接上一 head → 根索引追加摘要行并置新文件为 head。
2. IF 同 thread 已有旧 head，THEN 新记录创建后 SHALL 将旧记录 `status` 置为 `superseded` 且仅在新记录完整承接其有效事实之后执行。
3. THE 系统 SHALL NEVER 删除或移动既有缓存文件作为 create 的副作用。

### Requirement 3：ctx-append 流程

**User Story:** 作为 AI Agent，我要在同一会话多次压缩时把增量合并进现有文档而不是无限开新文件。

#### Acceptance Criteria

1. WHEN 执行 `ctx-append` 时，THE 系统 SHALL 定位当前 thread head 并原位更新：保持文件名与 `created` 不变、刷新 `updated`、可补充 `tags`。
2. 合并 SHALL 以“结构化整合 + Update Log 追加一条带时间戳的变化记录”方式进行，不得将第二份完整摘要粘贴到文件末尾。
3. WHEN append 完成，THE 系统 SHALL 同步 `.zh.md`、更新 `.i18n.yaml` 双侧 hash、并让根索引摘要行反映最新内容。
4. 追加时对 Problem、Requirements、Decision、Consequences、Verification 各实际存在小节做增量合并；新增的未解决要求 SHALL 保持 unresolved/partial 如实状态。

### Requirement 4：意图不明时的询问

**User Story:** 作为用户，“保存一下”这种模糊指令不应被 AI 默默武断分流。

#### Acceptance Criteria

1. WHEN 用户请求保存但无法判断是新建还是续写会话缓存，THEN AI SHALL 先向用户询问采用 create 还是 append，不得默认选择。
2. 自动猜测意图并被禁止的行为 SHALL NOT 出现在任何操作的流程描述中。

### Requirement 5：ctx-resume 渐进式披露

**User Story:** 作为恢复上下文的 AI Agent，我只想读最少的材料就能准确继续工作。

#### Acceptance Criteria

1. WHEN 执行 `ctx-resume` 时，THE 系统 SHALL 首先只读取根索引（L1），再依据任务相关性选取具体会话文档（L2），仅当当前记录缺事实或需追溯演变时沿 `prev:` 读历史或查归档索引（L3）。
2. 默认路径 SHALL 只读英文正典；SHALL NOT 默认读取中文镜像或全量扫描所有缓存。
3. resume 结束 SHALL 向用户报告恢复到的位置、活动线程状态与 `next` 行动项。

### Requirement 6：ctx-archive 生命周期迁移

**User Story:** 作为维护者，我需要 superseded 记录能安全地沉入归档区且链接不腐坏。

#### Acceptance Criteria

1. WHEN 执行 `ctx-archive` 时，THE 系统 SHALL 仅针对 `status=superseded|archived` 候选记录操作：三件套整体移动至 `archive/`，`status` 置为 `archived`，`head` 置 false。
2. 移动后 THE 系统 SHALL 修复三类链接：根索引中移除该行、归档索引追加条目、其他文档中的 `prev:` 相对路径全部改写。
3. IF 目标记录仍被某 active 记录的 `prev:` 引用且未承接事实，THEN archive SHALL 拒绝执行并提示先完成 superseded 流程。

### Requirement 7：历史保留原则

**User Story:** 作为项目成员，压缩不能变成悄悄抹掉历史。

#### Acceptance Criteria

1. 被取代记录 SHALL 以 `superseded` 保留并可经 `prev:` 链到达，永不物理删除（归档区除外）。
2. 更新记录时原决策理由、验证证据 SHALL 通过 Update Log 保留演进轨迹，SHALL NOT 用覆盖式重写抹除已有记录内容。
