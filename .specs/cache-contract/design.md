# Design Document

## Overview

cache-contract 是纯静态契约模块：产出物是 skill 内部的 reference 文档与模板，不包含可执行代码。它是 operations（行为规则）和 tooling（校验脚本）的共同依赖。

## Architecture

```text
skills/ctx/
├── SKILL.md                          # operations 模块负责
└── references/
    ├── cache-layout.md               # 1.1 布局 + 根/归档索引格式
    ├── file-naming.md                # 1.2 命名 + 三件套 + .i18n.yaml
    └── checkpoint-format.md          # 1.3 front matter + 正文骨架
templates/（随 references 内嵌代码块给出）
```

数据流：未来写入方（operations）读取这些契约文档 → 生成符合契约的产物 → tooling 的 doctor 依据同一契约校验。契约的唯一真源是本模块的三个 reference 文档。

## Interfaces & Data Models

front matter schema（唯一形态）：

```yaml
created: YYYY-MM-DD HH:MM <timezone>
updated: YYYY-MM-DD HH:MM <timezone>
tags: []                      # 受控六词表子集
status: active                # active | superseded | archived
thread: <stable-kebab-slug>
prev: null                    # 相对路径 or null
head: true
next: <one-line-next-action>  # 可选
```

## Key Decisions

### Decision 1: 存储单位 = 会话，分类降级为 front matter tags

**Context:** 混合领域会话（feature + bug-fix）如何存？候选方案争论过任务拆分、session 目录分层等。

**Options Considered:**
- **Option A: 按 task 拆分进分类目录** — Pros: 分类检索直接 / Cons: 需 6 个分类目录 + 分类索引，跨类任务被切碎，索引翻倍 / Effort: medium
- **Option B: 增加 session 分组层** — Pros: 能回答“这次会话做了啥” / Cons: 第四层导航、每次保存维护 2~3 个索引 / Effort: high
- **Option C: 会话为单位平铺 + tags** — Pros: 一份文档直接回答整个会话；导航固定两级；混合领域零成本 / Cons: 分类检索退化为文本筛选（tags 承担）/ Effort: low

**Decision:** Option C（对应 docs/ctx-understanding.md §4 定稿）。

**Rationale:** “来自同一会话”由一份文档回答，“同一任务的历史演进”由 thread + prev 回答，两个维度各有归属，不需要额外层级。

### Decision 2: 双语凭据沿用 .i18n.yaml + git blob hash

**Context:** 中英镜像同步需要机器可校验的一致性证据。

**Options Considered:**
- **Option A: mtime 对比** — 无法证明内容一致，误报多
- **Option B: 自增版本号** — 仍可能两侧号相同而内容漂移
- **Option C: git blob hash 配对** — 内容寻址，hash 相等 ⇔ 内容相等

**Decision:** Option C（源自 DeepSeek Harness 实践）。Rationale: hash 提供数学上可靠的一致性判定，tooling 可离线校验。

### Decision 3: 正文骨架收缩到六节

**Context:** 初版十五章节模板被认为过度冗长（DeepSeek notes 实际远比其精简）。

**Options Considered:**
- **Option A: 全十五节模板** — 求全但产生空壳段落与复制粘贴式噪音
- **Option B: 六节 + 显式省略规则** — 允许作者删掉无内容的节，通过索引四字段+Tags 保证检索面

**Decision:** Option B（Problem / Requirements / Decision / Consequences / Verification / Update Log）。Rationale: 六节恰好覆盖索引四问 + 要求追踪 + 变更日志；“下一步”这类单行信息下沉到 front matter `next:`。

## Error Handling

| Scenario | Handling |
|----------|----------|
| 文件名分钟级冲突 | 追加 `-NN` 序号后缀（确定性递增），命名规范文档给出示例 |
| 契约文档与 understanding 文档措辞冲突 | 以 docs/ctx-understanding.md 为最高规范，reference 只是展开 |
| 受控词表需要新增标签 | 必须先修订本模块 requirements 再扩展词表，禁止任意造词 |

## Correctness Properties

*A property is a formal statement about what the system should do.*

### Property 1: 三件套完整性

*For any* 平铺层中的 `<base>.md`，存在同名 `<base>.zh.md` 与 `<base>.i18n.yaml` 且三者仅由同一个 `<base>` 关联。

**Validates: Requirements 2.1, 7.1**

### Property 2: front matter 可机读性

*For any* 英文正典文档，front matter 解析结果满足 Req 3 全部字段子句；任一枚举外取值都无法通过解析校验。

**Validates: Requirements 3.1–3.5**

### Property 3: 双向索引覆盖

*For any* status=active 的平铺文档，根索引中恰有一行摘要指向它；反之根索引每行都指回真实存在的 active 文档。

**Validates: Requirements 5.1, 5.3, 6.2**

### Property 4: 时间字典序稳定

*For any* 两个不同的缓存文档，创建时间更早者的文件名字典序更小（含 -NN 后缀场景下前缀仍然可比）。

**Validates: Requirements 2.1, 2.2**
