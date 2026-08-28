# Requirements Document

## Introduction

把检查点正文大纲从「分析方法骨架」（Problem / Requirements / Decision / Consequences / Verification）改为「类型骨架」（architecture / process / feature / simplification / bug-fix / testing）：类型是章，分析方法是节内固定子字段。同时反转 tags 真源（节 → tags）、doctor 只认新骨架并完全改写存量。用户已确认四项决议：节内子字段结构、单骨架不兼容旧版、canonical 定序与空节省略。

## Glossary

- **类型节（type section）**：以六个受控类型词命名的正文大章节（`## architecture` 等）。
- **子字段（sub-field）**：类型节内的固定分析元素——`**Requirements**`（表格）、`**Decision**`、`**Consequences**`、`**Verification**`。
- **退化检查点**：无任何类型内容的纯定向会话检查点（标题 + Update Log，tags: []）。
- **canonical 定序**：多个类型节共存时的强制排列顺序。

## Requirements

### Requirement 1：类型节骨架

**User Story:** 作为恢复既往工作的 Agent，我希望检查点正文按工作类型组织，使 resume 的检索键与正文结构直接对应。

#### Acceptance Criteria

1. 正文 SHALL 仅由以下元素组成：文档标题（`# Context Checkpoint: <title>`）、零或多个类型节、`## Update Log`；不得出现任何其他 `##` 级大标题。
2. 类型节 SHALL 取自封闭词表（与 tags 词表同源六个：architecture / process / feature / simplification / bug-fix / testing），且 WHEN 出现 ≥2 个类型节时 SHALL 按 canonical 定序排列：architecture → process → feature → simplification → bug-fix → testing。
3. 每个类型节 SHALL 仅包含固定子字段：`**Requirements**`（表格）、`**Decision**`、`**Consequences**`、`**Verification**`；无内容的子字段整体省略，无内容的类型节整体省略。
4. 子字段语义承继现契约条款（需求状态词表、Verification 诚实规则、Decision 内联路径），规则文本 SHALL NOT 重复定义，引用 checkpoint-format 相应条款。
5. IF 会话无任何类型内容（纯定向/理解），THEN 检查点为退化形态：标题 + Update Log 且 `tags: []`。
6. `## Update Log` SHALL 保持全局（跨类型时间线），条目格式不变。

### Requirement 2：tags 真源反转

**User Story:** 作为维护者，我希望分类只有一个真源，消除 front matter 标签与正文结构互不相认的漂移面。

#### Acceptance Criteria

1. tags SHALL 等于非空类型节的集合，由 ctx-create / ctx-append 在写完正文后机械推导；独立「选择 tags」步骤 SHALL 被移除。
2. doctor SHALL 校验 tags 与类型节集合双向相等，违约计 violation（新类别 `tags-section-mismatch`）。
3. SKILL.md standing rule 5 SHALL 修订为：分类以正文类型节为真源，front matter tags 为推导值；仍不得创建分类目录或额外索引。

### Requirement 3：doctor 单骨架

**User Story:** 作为维护者，我希望校验器只认新骨架，杜绝新旧格式并存。

#### Acceptance Criteria

1. doctor SHALL 只接受新骨架；正文出现 legacy 大标题（Problem / Requirements / Decision / Consequences / Verification 作为 `##` 级标题）SHALL 计 violation（新类别 `legacy-skeleton`）。
2. doctor SHALL 校验类型节相对顺序符合 canonical 定序，违约计 violation（新类别 `section-order`）。
3. doctor SHALL 校验类型节词表封闭性与子字段合法性（未知类型节、未知子字段 → violation，新类别 `section-vocab` / `subfield-invalid`）。
4. 退出码协议（0/1/2）、violation 输出格式、校验范围约定 SHALL 与 tooling 契约一致，不放宽。

### Requirement 4：存量完全改写迁移

**User Story:** 作为本仓库的自举用户，我希望现存检查点与示例全部迁移到新骨架，使整个仓库只有一个格式。

#### Acceptance Criteria

1. `.agents/context/` 现存检查点三件套 SHALL 被改写为新骨架：内容保留（决策、需求行、证据、Update Log 全部保留，仅结构重排），Update Log SHALL 追加一条格式迁移记录。
2. examples/（csv-import、login-redesign）SHALL 重写为新骨架展示（canon + zh 同步）；empty-skeleton 无检查点文件，仅核对索引不受影响。
3. 迁移完成后，doctor 对 `.agents/context` 与两个示例目录 SHALL 均以退出码 0 通过。
4. 仓库内 SHALL NOT 保留任何 legacy 骨架文件（双版本并存被禁止）。

### Requirement 5：契约文档与双语同步

**User Story:** 作为双语纪律的执行者，我希望契约、示例与规格指针一次改齐。

#### Acceptance Criteria

1. checkpoint-format.md SHALL 重写 Body skeleton 一节（类型节 + 子字段 + 推导规则 + 定序）；front matter 部分仅改 tags 注释为「由类型节推导」。
2. cache-layout.md 的骨架流描述与索引示例行、SKILL.md 的 rule 5 与 ctx-create / ctx-append 的 tags 步骤 SHALL 同步修订。
3. docs/ctx-understanding.md §8 的旧骨架 SHALL 改写或改为指向 checkpoint-format.md，source-of-truth 指针不再指向被取代的格式。
4. 全部正典改动 SHALL 在同一提交内同步 skills-zh 镜像（checkpoint-format.zh.md、cache-layout.zh.md、SKILL.zh.md 及示例 zh 镜像）。
5. 已归档的 cache-contract/CHANGELOG.md SHALL 追加「正文骨架条款由 type-outline 取代」注记。
