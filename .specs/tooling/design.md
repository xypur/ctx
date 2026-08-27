# Design Document

## Overview

tooling 提供 `skills/ctx/scripts/` 下两个入口脚本与一个共享解析库。全部自研无依赖，测试以 fixture 目录 + 错误注入完成。

## Architecture

```text
skills/ctx/scripts/
├── lib.mjs        # front matter 解析、索引解析、i18n yaml 读写
├── init.mjs       # 入口: node init.mjs <root>
└── doctor.mjs     # 入口: node doctor.mjs [<root>] [--update-i18n]
```

数据流：init 读 templates-in-code（内嵌字符串模板）→ 产出骨架；doctor 读真实缓存 → parse → rule set → violations[] → 摘要 + 退出码。

## Interfaces & Data Models

```ts
type Violation = { category: string; file: string; detail: string }
// categories: schema | naming | triplet-missing | index-coverage |
//             head-dup | prev-broken | tags-vocab | status-enum | i18n-stale | unexpected-entry
```

`.i18n.yaml` 形态：

```yaml
en_blob: <40-hex>
zh_blob: <40-hex>
synced_at: YYYY-MM-DD HH:MM
```

## Key Decisions

### Decision 1: 零依赖 Node ESM 脚本

**Context:** 各 AI CLI 宿主环境运行时不可控，但 Node 普遍可得；校验需要 front matter/YAML 解析与 hash 计算。

**Options Considered:**
- **Option A: POSIX bash** — 解析 markdown/yaml 过于脆弱
- **Option B: Python3 标准库** — 同样普遍可行
- **Option C: Node ESM + crypto/child_process**

**Decision:** Option C。Rationale: JSON 摘要输出原生支持，`crypto.createHash('sha1')` 直接算 git blob hash（`sha1(blob\n)`），ESM 无构建步骤；Python 亦可作为后备实现，若宿主缺 Node 由适配层替换，契约不变。

### Decision 2: git blob hash 复算自哈希算法

**Options Considered:** 逐文件调 `git hash-object`（正确但慢、依赖仓库状态）vs 复刻 `sha1("blob <len>\0" + content)` 内存计算。

**Decision:** 复刻算法，仅在需要与仓库实际提交比对的 stale 判定场景退化用 `git ls-files -s` 取已暂存 hash 兜底。Rationale: 快照阶段文件未必入库，内存算法让校验对未提交状态也成立。

### Decision 3: violation 枚举固定类别

**Context:** 若自由文本报错，CI 无法归类统计。

**Options Considered:** 自由 message vs 固定 category 字典。

**Decision:** 固定字典（见 Interfaces），detail 自由。Rationale: 类别即规格断言点，tasks 的错误注入按类别逐一验证。

## Error Handling

| Scenario | Handling |
|----------|----------|
| root 不存在 / 不是目录 | exit 2，usage 提示 |
| 非 git 环境需要 i18n 校验 | i18n 项标记 skipped 不误报 stale，摘要注明 |
| front matter 解析失败 | 该文件记 1 条 `schema` violation，继续扫描其余文件 |

## Correctness Properties

*A property is a formal statement about what the system should do.*

### Property 1: 违约必检性

*For any* 注入的属于固定类别的样本违规，doctor 必须产出该类别 violation 且退出码非 0。

**Validates: Requirements 2.1, 2.2**

### Property 2: 空而健康闭环

*For any* init 新生成的骨架目录，doctor 扫描结果为零 violation、退出码 0。

**Validates: Requirements 1.1, 5.1**

### Property 3: 默认无副作用

*For any* 不带 `--update-i18n` 的 doctor 运行前后，目标树的文件内容与 mtime 保持不变。

**Validates: Requirements 4.2**

### Property 4: stale 可判定

*For any* 单侧语言文件被改后，i18n 校验结果恰将该侧判为 stale 且计入 violation；执行 `--update-i18n` 后同一文件恢复 synced。

**Validates: Requirements 3.1, 3.2, 3.3**
