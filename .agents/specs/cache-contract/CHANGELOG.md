# cache-contract Change Log

## 2026-08-27

- 创建模块规格：requirements 7 组 / design 3 决策 4 性质 / tasks 4 条（1 个 checkpoint）。
- 来源决议：会话级存储取代任务拆分；扁平布局 + archive/ 唯一子目录；分类以 front matter tags 表达；检查点正文收缩至六节；双语沿用 i18n.yaml blob-hash 凭据。

## 2026-08-27（位置迁移）

- skill 本体由 `.agents/skills/ctx/` 迁移至项目根 `skills/ctx/`，并新增 `skills-zh/ctx/` 中文镜像目录（SKILL.md + references 等价翻译；scripts 不翻译、仅存于英文侧）。
- 三份 reference 内容本身未变；镜像翻译以英文正典为准同步维护。
- 追加命名规则：中文镜像技能的所有文件统一带 `.zh.md` 后缀（SKILL.zh.md、references/*.zh.md），内部交叉链接同步更新。

## 2026-08-27（规格联动 + 目录迁移）

- **规格目录迁移**：本规格集整体由项目根 `.specs/` 迁至 `.agents/specs/`，与 `.agents/` 作为跨工具 agent 状态目录的惯例统一（缓存已在 `.agents/context/`）；完全切换，不保留旧路径回退。文中自引用已同步更新；tasks.md 中两个 gate 任务原先的 `1.x` 通配式需求引用改为具体条款清单（通过 specs-workflow 的 validate-specs.js 校验所需）。
- **新增"规格联动会话"规则**：checkpoint-format.md（及 understanding §8）允许 Requirements 表直接引用 `.agents/specs/<module>/requirements.md` 的条款号（ID 列如 `cache-contract 3.4`），Evidence 指向仓库内路径；状态词表不变，但 `solved` 必须与 `.agents/specs/index.md` 任务勾选一致；检查点只记会话增量，不改写规格状态。无 `.agents/specs/` 的项目行为不变。
- Rationale：消除会话记忆与规格文档之间的语义重复与双份状态漂移——ctx 引用而不复制 specs 的需求定义。

## 2026-08-27（部分取代）

- 正文骨架条款（§8 六节 Problem/Requirements/Decision/Consequences/Verification/Update Log）由 `.agents/specs/type-outline/` 取代：大纲改为类型节 + 节内分析子字段，tags 由类型节推导。front matter、命名、三件套、索引与凭据条款继续有效。
