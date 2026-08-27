# operations Change Log

## 2026-08-27

- 创建模块规格：requirements 7 组 / design 3 决策 5 性质 / tasks 5 条（2 个 gate 性任务之一为终检）。
- 关键决议记录：create/append 对立命名取代 save/update；三层渐进披露；状态机集中于 front matter、操作仅做合法迁移。

## 2026-08-27（位置迁移）

- SKILL.md 由 `.agents/skills/ctx/` 迁移至项目根 `skills/ctx/SKILL.md`；`skills-zh/ctx/SKILL.zh.md` 为中文镜像，操作流程规则逐条等价翻译，共通规则与五操作语义不变。

## 2026-08-27（规格联动）

- SKILL.md（含中文镜像）新增两处联动规则：ctx-create 在存在 `.agents/specs/` 的项目中 Requirements 表直接引用规格条款号而不重述需求；ctx-resume 读完根上下文索引后紧接着读 `.agents/specs/index.md`——规格文档是模块/任务状态的唯一真源，上下文索引是会话记忆的唯一真源，ctx 操作只读规格、绝不编辑。五操作核心流程与状态机不变（对应 cache-contract 的"规格联动会话"修订）。
