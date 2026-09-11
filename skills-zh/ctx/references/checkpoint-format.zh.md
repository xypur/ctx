# 检查点格式

会话检查点的正文骨架与 front matter 模式。
真源：`.agents/specs/type-outline/`（正文大纲与 tags 推导）；存储与命名理由见
`docs/ctx-understanding.md` §3–§5。目标：一次压缩几十行写完；空小节、空子字段
直接省略；绝不为填模板而注水。

## Front matter

每个正典检查点的必备 YAML 头：

```yaml
---
created: 2026-08-27 09:41 +08:00
updated: 2026-08-27 14:02 +08:00
tags: []                       # 由正文类型节推导——绝不独立挑选
status: active                 # active | superseded | archived
thread: login-session          # 分组相关记录的稳定 kebab-case slug
prev: null                     # 上一 head 的相对路径，或 null
head: true
next: wire refresh redirect    # 可选，一行的下一步行动
---
```

字段规则：

| 字段 | 规则 |
|---|---|
| created | 由 ctx-create 设置一次，此后不变（append 不改） |
| updated | 每次 append 刷新 |
| tags | MUST 等于正文实际出现的类型节集合；doctor 强制校验相等 |
| status | 状态机：active → superseded → archived |
| thread | 跨会话分组同一任务的历史 |
| prev | 同线程上一 head，或 null |
| head | 本文档是线程最新活动记录时才为 true |

受控类型词表——同一组值既是 tags 取值，也是正文类型节名：

| 标签 / 类型节 | 含义 |
|---|---|
| feature | 新增用户或模型可见能力 |
| bug-fix | 修复缺陷、回归或缺失行为 |
| architecture | 代码结构、数据模型、契约或不变量决策 |
| process | 工作流、政策、工具和维护规则 |
| simplification | 有意减少代码、行为或表面复杂度 |
| testing | 测试基础设施、策略和验证设计 |

多类型节共存时的 canonical 定序：
`architecture → process → feature → simplification → bug-fix → testing`。

新增取值必须先修订 type-outline 规格——禁止临时造词。

## 语言契约

每份检查点是一对双语文件：正典（`<base>.md`）纯英文，镜像（`<base>.zh.md`）
中文。正典是 Agent 默认读取的版本；镜像是供人类阅读的结构孪生。整份契约由
`doctor.mjs` 以 `canon-language`、`mirror-language`、`mirror-structure`
三类规则机械强制。

正典规则：

1. 正典（含 front matter）在代码区之外 MUST 零 CJK 与全角字符：
   U+2E80–2EFF、U+3000–303F、U+3040–U+30FF、U+3400–U+4DBF、U+4E00–U+9FFF、
   U+F900–U+FAFF、U+FE30–U+FE4F、U+FF00–U+FFEF。
2. WHEN 会话需要引用中文原文、UI 文案或用户原话，正典 MUST 用行内 code
   或代码围栏承载，不得作为正文出现；路径、命令、字面字符串同理。
3. `next:` 与其它自然语言 front matter 字段为英文，同属正典正文。

镜像规则：

4. 同样剔除代码区后，镜像中 CJK 字符占其字母总数的比例 MUST ≥ 30%：
   即 `CJK / (CJK + 拉丁字母)`。仅是复制正典的镜像必然不达标。
5. 镜像 MUST 是正典的结构孪生：
   - front matter 键集合相同，除 `next` 为译文外各值逐项一致；
   - H1 为「正典标题 + `（中文镜像）`」；
   - `##` 与 `###` 标题序列完全一致——类型节名与子字段名保持英文；
   - 需求表 ID 序列完全一致。
6. 结构关键词（类型节名、子字段名、状态枚举、front matter 键名）两侧
   一律英文，不翻译。

成文纪律：先直接以英文写成正典，再由成品正典派生镜像。禁止先写中文草稿、
只翻译标题——那正是本契约要消灭的「假英文」。

## 正文骨架

大纲即工作类型分类法。分析性问题——需要什么、决策了什么、带来什么、
如何验证——是类型节内的子字段，绝不是顶级标题。

```markdown
# Context Checkpoint: <title>

## architecture

### Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|

### Decision

做了什么决策、为什么、哪些文件/行为变化了
（关键路径内联列出；不设 Created/Modified 子清单）。

### Consequences

收益、代价和取舍，几行即可。

### Verification

如何验证，结果是什么。

## process

… （只写有内容的类型节，按定序排列）

## Update Log

- 2026-08-27 14:02: 追加了什么变化。
```

结构规则：

1. `##` 级标题只允许两种：类型节（小写、与词表逐字一致）和 `## Update Log`。
   旧式分析标题——`Problem` / `Requirements` / `Decision` / `Consequences` /
   `Verification` 作为 `##` 标题——一律构成契约违约。
2. 类型节内恰好四种子字段标题——`### Requirements`（表格）、`### Decision`、
   `### Consequences`、`### Verification`——且 `###` 级不做他用。空子字段省略；
   无内容的类型节整体省略。
3. Requirements 的 ID 全文全局编号（规格条款引用保持稳定）；行放在所属类型节的表格里。
4. `## Update Log` 保持全局——检查点的跨类型时间线。
5. 纯定向会话允许退化为 标题 + Update Log 且 `tags: []`。

写作规则：

1. 一次压缩几十行写完；不留无信息量的注水段落。
2. 关键技术上下文在确实有助于理解时，并入相关类型节的 `### Decision` 子节。
3. 变更以内联路径清单并入 `### Decision`。

### 需求状态

每行需求恰有一个状态：

- `solved` — 已完成且有证据支撑；
- `partial` — 重要部分仍未完成；
- `unresolved` — 尚未处理；
- `deferred` — 明确延期；
- `rejected` — 经过考虑后拒绝，并记录理由。

绝不因为计划写完就把工作标成 solved。

### 规格联动会话

当项目在 `.agents/specs/` 下维护模块规格时，相关类型节的 `### Requirements`
表直接引用其条款，不另行定义：

1. `ID` 引用规格条款号（如 `type-outline 3.4`）；不得转述或重写需求文本——
   只做链接引用。
2. `Evidence` 指向仓库内证据：`.agents/specs/` 下的路径、代码路径或命令输出。
3. 状态仍用上述诚实词表，且必须与 `.agents/specs/index.md` 中模块任务勾选一致：
   只有实现任务在那里已勾选时才可标 `solved`。
4. 检查点只记录会话增量，不改写规格状态。范围或状态确实变化时，应更新
   规格文档本身。

没有规格目录的项目照旧定义轻量的会话级需求行——其余规则不变。

### 验证诚实性

在 `### Verification` 子节中：

- 只有真实命令输出或评审证据才可写 `passed` / `failed`；
- 否则写 `Not run`；
- “应该可以”永远不是已验证。
