# Design Document

## Overview

一次契约级格式反转：正文大纲从分析维度换成类型维度，分析方法降级为节内子字段；tags 由推导产生；doctor 从「不校验正文」升级为「只认新骨架」。用户已确认全部关键决议，本设计只做落地化。

## Architecture

```text
正文结构（新）：
# Context Checkpoint: <title>
## architecture | process | feature | simplification | bug-fix | testing   ← 0..6 个，按定序，空省略
    **Requirements** 表格（可选）   ← 子字段，空省略
    **Decision**（可选）
    **Consequences**（可选）
    **Verification**（可选）
## Update Log                                                              ← 恒在，全局
```

数据流：ctx-create/append 写类型节 → 机械推导 tags 写入 front matter → doctor 解析正文标题与子字段 → 校验 legacy 缺席 / 定序 / 词表 / 子字段 / tags↔节相等。

## Components / Composables

doctor 新增解析层（lib.mjs 扩展）：

```ts
parseBody(markdown) -> {
  title: string,
  sections: Array<{ type: string, subfields: string[] }>,  // 按出现顺序
  updateLog: boolean,
}
```

规则集在现有九类之上追加五类：`legacy-skeleton | section-order | section-vocab | subfield-invalid | tags-section-mismatch`；现有规则与退出码协议不动。

## Key Decisions

### Decision 1: 章 = 类型，方法 = 节内子字段

**Context:** Problem→Verification 是分析一件事的提问方式，不是归档结构；resume 的第一检索键是工作类型。

**Decision:** 类型作大章节，分析元素（Requirements / Decision / Consequences / Verification）降级为节内固定子字段，空则省略。**Validates: 用户决议 1。**

### Decision 2: tags 真源反转

**Context:** tags 词表与类型词表本就同源，双载体必然漂移。

**Decision:** 类型节为真源，tags 机械推导，doctor 校验双向相等；SKILL.md standing rule 5 同步反转。**Validates: 用户决议 1（采纳我的建议）。**

### Decision 3: 单骨架 + 完全改写（不兼容旧版）

**Context:** 用户明确「不要兼容旧版，完全改写」。

**Options Considered:**
- **Option A: doctor 双骨架兼容 + 存量保留** — Cons: 永久背负两族格式，校验复杂化
- **Option B: 单骨架，存量内容保留式改写** — Pros: 仓库内永远只有一个格式

**Decision:** Option B。改写是内容保留、结构重排；Update Log 追加迁移记录留痕，历史内容零丢弃，「历史永不删除」约束不破坏（内容未删，仅格式归一）。

### Decision 4: canonical 定序与空节省略

**Decision:** 定序 = architecture → process → feature → simplification → bug-fix → testing（用户给定，结构性类型在前、验证类收尾）；任何无内容类型节整体省略。**Validates: 用户决议 3。**

### Decision 5: 退化形态合法

**Decision:** 纯定向会话允许 标题 + Update Log + `tags: []`（沿袭现契约 tags:[] 允许），doctor 不视为违约。

### Decision 6: doctor 规则净增不改旧

**Decision:** 现有九类规则（front matter / naming / triplet / index / head / prev / status / i18n / structure）全部保留，骨架族规则为新增类别；Requirement 全局 ID 编号不变、行随类型节分布，spec-linked 引用规则原样适用（ID 引用规格条款）。

## Error Handling

| Scenario | Handling |
|----------|----------|
| 正文混入 legacy `##` 标题 | violation `legacy-skeleton` |
| 类型节顺序违反定序 | violation `section-order` |
| 未知类型节 / 未知子字段 | violation `section-vocab` / `subfield-invalid` |
| tags 与类型节集合不等 | violation `tags-section-mismatch` |
| 全部类型节为空且 tags 非空 | 同上（mismatch 覆盖） |

## Correctness Properties

### Property 1: tags 双向相等

*For any* 合法检查点，front matter tags 集合 ≡ 非空类型节集合。

**Validates: Requirements 2.1, 2.2**

### Property 2: 大标题封闭

*For any* 合法检查点，`##` 级标题序列 = canonical 定序的类型节子序列 + Update Log，无其他标题。

**Validates: Requirements 1.1, 1.2, 3.1, 3.2**

### Property 3: 迁移后全绿

*For any* 完成本模块后，doctor 对 `.agents/context` 与全部示例目录退出码 0；对注入的 legacy 样本报 `legacy-skeleton`。

**Validates: Requirements 3.4, 4.3, 4.4**
