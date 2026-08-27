# AGENTS.md — ctx 仓库工作约定

本仓库是 **ctx**：一个把 AI 会话压缩为决策导向项目记忆的 Agent Skill（核心在 `skills/ctx/`）。
本文件是 Agent 在本仓库工作的 always-on 约定，也是 instruction-tier 适配的唯一派生正典。

## 本仓库工作约定

- **规格先行**：任何实现工作开始前，先读 `.agents/specs/index.md`（状态栏 + 模块表），
  按 Next task 与依赖顺序推进；实现与勾选全程同步该索引。
- **双语纪律**：`skills/ctx/` 为英文正典，`skills-zh/ctx/` 为中文镜像；两侧行为语义必须
  逐条等价，一次提交内同步。
- **零依赖纪律**：`skills/ctx/scripts/` 与 `hooks/` 下脚本只用 Node 内置模块（ESM），
  不引第三方依赖。
- **文档语言**：规格与设计文档用中文（SHALL / WHEN 等规格关键词保留英文）。

## ctx 紧凑操作表

| 操作 | 含义 | 触发场景 |
|---|---|---|
| `ctx` | 显示缓存状态 + 根索引摘要 | 定位方向，或 create/append 之前 |
| `ctx-create` | 开启新会话检查点三件套 | 会话首次压缩 |
| `ctx-append` | 向当前检查点合并更多内容 | 同一会话的后续压缩 |
| `ctx-resume` | 渐进披露恢复既往工作 | 开始可能受历史影响的工作 |
| `ctx-archive` | 把被取代记录移入 `archive/` | 取代后的整理 |

完整流程与格式契约见 `skills/ctx/SKILL.md` 与 `skills/ctx/references/`（按需读取，勿预载）。

## 记忆与恢复（重要）

本仓库使用 ctx 自举：`.agents/context/index.md` 是会话记忆的唯一真源。

- **恢复既往工作，先读 `.agents/context/index.md`**，再按 ctx-resume 的渐进披露按需读取。
- `.agents/specs/index.md` 是模块/任务状态的唯一真源；ctx 操作只读规格、绝不编辑。
- 新压缩默认走 ctx-create / ctx-append——用户未指明时先问，不静默选。
- 历史永不删除：取代只改 `status`，归档只移动文件，更新走 Update Log。

## 与 ponytail 的关系

适配层分层借鉴 `~/dev/references/ponytail` 的 Agent Portability
（Adapter Rule：核心行为只在 `skills/ctx/`，适配器保持薄、只提供入口），
不依赖其任何文件。适配矩阵见 `docs/agent-portability.md`。
