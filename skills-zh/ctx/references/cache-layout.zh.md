# 缓存布局与索引契约

`.agents/context/` 形态与索引的规范性参考。
设计理由见 `docs/ctx-understanding.md` §4 与 §6；`scripts/doctor.mjs` 以此契约做机械校验。

## 布局

```text
.agents/context/
├── index.md                        # 根索引 — 唯一常规导航入口
├── YYYY-MM-DD-HHMM-<slug>.md       # 会话检查点，平铺
├── YYYY-MM-DD-HHMM-<slug>.zh.md    # 中文镜像（伴生文件）
├── YYYY-MM-DD-HHMM-<slug>.i18n.yaml
└── archive/
    ├── index.md                    # 已归档记录的一行式索引
    └── <移入的三件套>
```

规则：

1. `archive/` 是 `.agents/context/` 下唯一允许存在的子目录。
2. 根层级只允许 `index.md`、平铺的检查点三件套和 `archive/`。
3. 禁止创建 `feature/`、`bug-fix/` 之类的分类目录；分类一律通过 front matter 的 `tags` 表达（见 `checkpoint-format.md`）。
4. `.zh.md` 与 `.i18n.yaml` 是正典的伴生文件，绝不作为独立记录进入任何索引。
5. 每个会话一份检查点，使“这次会话发生了什么”从单个文件即可回答；同一任务跨会话的历史沿 `prev:` 链传递。

## 根索引（index.md）

根索引是轻量决策摘要，不是目录转储。它恰好包含三部分：

1. **Active Threads** — 当前线程表及 head 指针；
2. **Records** — 每个活动检查点文档一行摘要；
3. **Archive link** — 指向归档索引的链接。

`init.mjs` 渲染的新骨架：

```markdown
# Context Index

AI-facing first entry to project memory. One summary line per active record:
Problem → Decision → Consequences → Verification.

## Active Threads

| Thread | Head | Updated |
|---|---|---|

## Records

## Archive

Superseded/archived records: [archive/index.md](archive/index.md)
```

记录行格式（单行，字段顺序固定）：

```markdown
- [2026-08-26-2115-login-session-fix.md](2026-08-26-2115-login-session-fix.md) — Problem: <一行>; Decision: <一行>; Consequences: <一行>; Verification: passed|failed|Not run · tags: feature, bug-fix
```

线程行格式：

```markdown
| login-session | 2026-08-26-2115-login-session-fix.md | 2026-08-27 09:41 |
```

维护规则：

1. 每个 `status: active` 文档恰有一行 Records 记录；每行 Records 都指向真实存在的活动文档。
2. 文档 status 离开 `active`、或被移入 `archive/` 时，其 Records 行立即移除；Active Threads 行在同一编辑中更新或删除。
3. 摘要保持紧凑（每条一行）。完整理由、完整文件列表和验证输出都在检查点内部——索引只帮助 Agent 判断该打开哪条记录。

## 归档索引（archive/index.md）

新骨架：

```markdown
# Archive Index

One line per superseded/archived record, newest first.

- [2026-08-26-1801-old-thread.md](old-thread.md) — <title> · superseded by [2026-08-26-2115-login-session-fix.md](../2026-08-26-2115-login-session-fix.md) on 2026-08-26
```

规则：

1. 条目是一行式摘要（标题 + 日期 + 链接 + 原因）；此处不要求决策四字段。
2. `ctx-archive` 移动三件套时，归档索引在顶部新增条目，且所有外部链接在同一操作中修复（见 SKILL.zh.md → ctx-archive）。
