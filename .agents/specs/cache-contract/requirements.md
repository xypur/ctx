# Requirements Document

## Introduction

定义 `.agents/context/` 缓存的全部静态契约：扁平目录布局、文件命名、双语三件套、front matter 元数据、检查点正文结构与根/归档索引格式。任何写入缓存的产物都必须符合本契约，operations 与 tooling 模块均以本契约为依据。

## Glossary

- **会话缓存文档**：一次压缩产出的检查点文件（三件套），存储单位是会话而非单个任务。
- **三件套**：`<base>.md`（英文正典）、`<base>.zh.md`（中文镜像）、`<base>.i18n.yaml`（配对凭据）。
- **head**：某 thread 当前最新的活动记录。
- **受控标签集**：feature / bug-fix / architecture / process / simplification / testing 六个词表。

## Requirements

### Requirement 1：扁平缓存布局

**User Story:** 作为维护项目的 AI Agent，我希望缓存目录只有一层子目录，以便用最少的跳转定位历史。

#### Acceptance Criteria

1. THE 系统 SHALL 只在 `.agents/context/` 下放置 `index.md`、平铺的会话缓存文档和唯一的 `archive/` 子目录。
2. WHEN 初始化一个新项目缓存时，THE 系统 SHALL 创建 `.agents/context/index.md` 与 `.agents/context/archive/index.md`，且不创建 feature/ bug-fix/ 等任何分类子目录。
3. IF 发现 `.agents/context/` 下存在契约之外的子目录或索引文件，THEN 该布局视为违约（可被 doctor 检出）。

### Requirement 2：文件命名与三件套

**User Story:** 作为恢复上下文的 AI Agent，我需要通过文件名即可获得时间顺序并区分语言版本。

#### Acceptance Criteria

1. 会话缓存文档 SHALL 使用 `YYYY-MM-DD-HHMM-<kebab-slug>.md` 命名；三件套 SHALL 共享同一 `<base>` 名，分别为 `<base>.md`、`<base>.zh.md`、`<base>.i18n.yaml`。
2. IF 同一分钟内出现命名冲突，THEN 新文件 SHALL 追加确定性序号后缀 `-02`、`-03`（依序递增）解决冲突。
3. THE slug SHALL 仅使用小写 kebab-case，能概括该次压缩的主题。

### Requirement 3：front matter 元数据

**User Story:** 作为 AI Agent，我要机器可读的元数据来筛选记录和沿链回溯。

#### Acceptance Criteria

1. 每个英文正典文档 SHALL 以 YAML front matter 开头，包含字段：`created`、`updated`、`tags`、`status`、`thread`、`prev`、`head`，可选字段 `next`。
2. `tags` SHALL 只使用受控标签集内的值且可组合、可为空数组。
3. `status` SHALL 是 `active | superseded | archived` 之一。
4. `prev` SHALL 为同 thread 上一 head 的相对路径或 `null`；`thread` SHALL 为稳定的 kebab-case slug。
5. IF 任一字段缺失、枚举非法或使用了词表外的标签，THEN 视为违约（doctor 可检出）。

### Requirement 4：检查点正文结构

**User Story:** 作为写记录的 AI Agent，我需要一个不啰嗦但保证关键信息齐全的正文骨架。

#### Acceptance Criteria

1. 正文 SHALL 以 `# Context Checkpoint: <title>` 开始，按序包含可选小节：Problem、Requirements、Decision、Consequences、Verification、Update Log。
2. 没有内容的小节 SHALL 直接省略，不留空壳；整体目标为几十行讲完一次压缩。
3. Requirements 表中每项要求 SHALL 标注状态之一：solved / partial / unresolved / deferred / rejected，有证据的 SHALL 附 Evidence。
4. Verification 小节 SHALL 如实标注 passed / failed / Not run，不得把“应该可以”写成“已验证”。

### Requirement 5：根索引格式

**User Story:** 作为恢复上下文的 AI Agent，我把根索引作为第一入口，希望它一行看完就能判断要打开哪条记录。

#### Acceptance Criteria

1. 根索引 SHALL 包含三部分：当前活动线程及其 head、每个活动缓存文档的一行摘要（含 tags）、归档索引链接。
2. 索引摘要 SHALL 覆盖 Problem、Decision/changes、Consequences、Verification 四个问题与 Tags 字段，保持一行或几行的紧凑密度。
3. WHEN 一个文档从 archive/ 之外消失或 status 非 active 时，THEN 其独立摘要行 SHALL 从根索引移除。

### Requirement 6：归档索引格式

**User Story:** 作为追溯决策演变的 AI Agent，我需要归档区有一条单独的一行式索引。

#### Acceptance Criteria

1. archive/ 目录 SHALL 维护自己的 `index.md`，条目为一行式摘要（标题 + 日期 + 链接）。
2. 被取代或归档的记录 SHALL 从根索引移除并出现在归档索引中。

### Requirement 7：双语文档与 i18n 凭据

**User Story:** 作为中文使用者同时作为默认读英文的 AI Agent，我们共享同一份事实而各自读偏好的版本。

#### Acceptance Criteria

1. `.md` SHALL 是英文正典与 AI 默认读取版本；`.zh.md` SHALL 是内容等价的中文镜像；镜像不作为独立记录列入 index。
2. `.i18n.yaml` SHALL 记录两侧最近一次确认一致时的 git blob hash。
3. WHEN 编辑任一语言版本后，THE 系统 SHALL 先同步另一侧，再更新 `.i18n.yaml` 中的两侧 hash。
