# Design Document

## Overview

在既有 doctor 架构上新增一族「语言门禁」规则：正典零 CJK、镜像中文占比下限、镜像结构孪生。判定全部为确定性文本统计与结构比较，零第三方依赖；现有九类规则、退出码协议与 `--update-i18n` 行为一概不动。契约文档与 SKILL.md 同步把门禁写进工作流，最后对齐仓库自持的三处记录（examples ×2、`.agents/context`）使正例全绿。

## Architecture

```text
写入侧（ctx-create / ctx-append）：
  以英文直接成文 canon ──→ 从成品 canon 派生 .zh.md ──→ 刷新 .i18n.yaml ──→ doctor 收尾必修至 healthy
                                    │
校验侧（doctor.mjs，按 base 逐记录）：│
  canon + zh 双读 ──→ stripCodeSpans ──→ cjkCount ──→ canon-language / mirror-language
                  └─→ front matter / H1 / headings / table IDs ──→ mirror-structure
```

判定口径（与 Requirement 1 一一对应）：

| 维度 | 方法 | 阈值 |
|---|---|---|
| 正典语言 | `stripCodeSpans` 后 CJK 计数 | 严格 0 |
| 镜像语言 | `stripCodeSpans` 后 `CJK / (CJK + 拉丁字母)` | ≥ 30% |
| front matter | 键集合相等；除 `next` 外各字段值相等 | 全等 |
| H1 | 镜像 H1 === 正典 H1 + `（中文镜像）` | 全等 |
| 标题序列 | `##`/`###` 原始标题序列（含子字段名）逐项比较 | 全等 |
| Requirements 表 ID | 全部表格首列 ID 序列（按出现顺序） | 全等 |

## Components / Composables

lib.mjs 扩展（沿用现有解析风格，全部纯函数）：

```ts
stripCodeSpans(text) -> string          // 先剔围栏（```/~~~），再剔行内 `code`
cjkCount(text) -> number                // 同时统计 CJK 与全角标点
latinCount(text) -> number
cjkRatio(text) -> number                // cjk/(cjk+latin)，分母 0 时返回 0
collectHeadings(text) -> string[]       // 围栏外 `##`/`###`，形如 "h2 Decision"
collectTableIds(text) -> string[]       // 首列表头为 ID 的表格，取首列单元格
MIRROR_CJK_MIN_RATIO = 0.3
CJK_RE                                  // 上述八段码点范围
```

doctor.mjs 接线：base 循环内读取 `zh`；`canonical` 与 `zh` 均存在时执行三族校验，否则跳过（`triplet-missing` 已报）。三类新 violation 与既有输出格式完全一致：

```text
violation: canon-language   | <path> | canon holds 905 CJK char(s) outside code spans — write English...
violation: mirror-language  | <path> | mirror CJK ratio 12.0% < 30% ...
violation: mirror-structure | <path> | H1 mismatch: expected "...（中文镜像）"
```

## Key Decisions

### Decision 1: 正典严格零 CJK，代码豁免承载引用

**Context:** 额度制（如"≤5 个汉字"）会给模型留出灰色地带，而中文原文、UI 文案、用户原话确实可能出现在会话里。
**Decision:** 严格 0；需要引用时放入反引号/围栏。引用类内容本就应使用 code span（路径、命令、字面字符串同理），豁免与良好书写习惯同向。**Validates: Requirements 1.1, 1.2, 1.3。**

### Decision 2: 占比分母取「CJK + 拉丁字母」

**Context:** 非空白字符口径会被 URL、路径、数字、标点稀释——真实镜像的最低占比已到 33.7%，按该口径设 30% 阈值余量不足。
**Decision:** `CJK / (CJK + 拉丁字母)`；现有三个真实镜像在该口径下为 41.2%–54.5%，30% 阈值有充足余量。**Validates: Requirements 1.4。**

### Decision 3: 镜像 = 结构孪生（含 front matter）

**Context:** 仓库现存三种互不一致的镜像形态——示例镜像不带 front matter（却宣称"与英文侧逐字段一致"）、真实缓存镜像带 front matter、astro-minima 镜像把标题中文化。
**Decision:** 取最完整形态并机械校验：front matter 键值（除 `next` 译文）、H1 后缀、标题序列、表 ID 序列四项全等。人类读者在镜像内即可获得 status/thread 等元数据；doctor 获得最高覆盖的对齐校验面。示例镜像按此补齐。**Validates: Requirements 1.5, 1.6。**

### Decision 4: 不做 status 豁免

**Context:** 门禁落地瞬间是否会大面积翻红存量文件，取决于历史包袱。
**Decision:** 实地盘点：全仓 3 份 canon 全为 `active`，archive 为空——零历史包袱；未来 superseded 记录写于门禁生效后，天然合格。统一强制比按 status 分档少一个分支，与 `i18n-stale` 等既有全量规则的形态一致。**Validates: Requirements 2.4。**

### Decision 5: 不做体积门禁

**Context:** 用户强调正典体积小，但行数/字节阈值会把长会话硬卡红。
**Decision:** 体积继续由 checkpoint-format.md 的写作指引（"tens of lines"）约束，不进 doctor；语言门禁天然压缩了膨胀空间（用英文总结比粘贴中文原文短）。**Validates: 用户决议 2。**

## Error Handling

| Scenario | Handling |
|---|---|
| 正典剔除代码后仍有 CJK | violation `canon-language`，消息含计数与修复提示 |
| 镜像占比 < 30% | violation `mirror-language`，消息含实际占比与阈值 |
| 镜像 front matter 缺失、键不等或值漂移 | violation `mirror-structure`，detail 指明维度 |
| 镜像 H1 不含 `（中文镜像）` 后缀 | violation `mirror-structure` |
| 镜像标题序列 / 表 ID 漂移 | violation `mirror-structure`，detail 给出首个差异项 |
| companion 缺失 | 既有 `triplet-missing`；语言/结构校验跳过 |

## Correctness Properties

### Property 1: 正典零 CJK

*For any* doctor-green 缓存，正典在 `stripCodeSpans` 后 CJK 计数恒为 0。

**Validates: Requirements 1.1, 2.1**

### Property 2: 镜像结构孪生

*For any* doctor-green 缓存，镜像与正典在 front matter（除 `next`）、H1、标题序列、表 ID 序列上逐项相等，且镜像 CJK 占比 ≥ 30%。

**Validates: Requirements 1.4, 1.5, 2.2, 2.3**

### Property 3: 门禁正交

*For any* 检查点，新三类规则的引入不改变既有规则的判定结果与退出码协议；语言门禁对正典与镜像的检查不因 `status` 取值而豁免。

**Validates: Requirements 2.4, 2.5, 4.2**

### Property 4: 写入侧闭环

*For any* 执行 ctx-create / ctx-append 的会话，操作最终步骤包含 doctor 运行且以 healthy 为完成前提。

**Validates: Requirements 3.1, 3.2, 4.3**
