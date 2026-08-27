# ctx

面向 AI 编码 Agent 的会话上下文压缩。ctx 把重对话的工作压缩为简短的、面向决策的
检查点，存放在 `.agents/context/` 下，让任何未来的 Agent 无需重放历史即可恢复工作。

English: [README.md](README.md)

## 为什么需要

聊天记录是一份糟糕的记忆：冗长、有损，且到下一个会话就消失。普通摘要会丢失决策脉络。
ctx 检查点记录的是**提过什么要求、做了什么决策以及为什么、改了什么、验证了什么、
从哪里继续**——以紧凑格式渐进披露给任何 Agent。

## 五个操作

| 操作 | 含义 | 触发场景 |
|---|---|---|
| `ctx` | 显示缓存状态 + 根索引摘要 | 定位方向，或 create/append 之前 |
| `ctx-create` | 开启新会话检查点 | 会话首次压缩 |
| `ctx-append` | 向当前检查点合并更多内容 | 同一会话的后续压缩 |
| `ctx-resume` | 渐进披露恢复既往工作 | 开始可能受历史影响的工作 |
| `ctx-archive` | 把被取代记录移入 `archive/` | 取代后的整理 |

基本规则：语义含糊先问（create 还是 append）· 历史永不删除 · 只写诚实状态 ·
英文正典 + 中文镜像 · 不建多余分类。

## 缓存布局

```text
.agents/context/
├── index.md                                 # 根索引 — 恢复的入口
├── <thread>/<date>-<HHMM>-<slug>.md         # 英文正典
├── <thread>/<date>-<HHMM>-<slug>.zh.md      # 中文镜像
├── <thread>/<date>-<HHMM>-<slug>.i18n.yaml  # 同步凭据（blob hash）
└── archive/                                 # 被取代的记录，永不删除
```

## 安装

ctx 是纯 Agent Skill——无运行时、零依赖。

| 宿主 | 方式 |
|---|---|
| 任何支持 Agent Skills 的宿主（Claude Code、pi、OpenCode、Codex 等） | 把 `skills/ctx/` 放入宿主的技能发现路径，或直接读取 `skills/ctx/SKILL.md` |
| 任何支持项目指令的宿主 | 在 `AGENTS.md` / `CLAUDE.md` 中加一条 resume 指针——写法见本仓库根 [AGENTS.md](AGENTS.md) |

插件适配（pi 包、OpenCode 命令、Codex / Claude Code 插件）在规划中——
见 [docs/agent-portability.md](docs/agent-portability.md) 的路线图。

## 与 ponytail 的关系

[ponytail](https://github.com/DietrichGebert/ponytail) 是 always-on 的写代码行为模式；
ctx 是按需的「做过什么」记忆操作。ctx 借鉴了 ponytail 的适配层分层
（适配器保持薄、正典唯一），但不依赖其任何文件。两者互补：ponytail 塑造写的过程，
ctx 记住做的结果。

## 文档

- [`skills/ctx/SKILL.md`](skills/ctx/SKILL.md) — 技能本体（行为契约）
- [`skills/ctx/references/`](skills/ctx/references/) — 缓存布局、命名、检查点格式
- [`docs/agent-portability.md`](docs/agent-portability.md) — 适配矩阵
- [`examples/`](examples/) — 示例缓存；[`skills/ctx/scripts/doctor.mjs`](skills/ctx/scripts/doctor.mjs) 可校验任意缓存
