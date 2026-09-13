# Design Document

## Overview

给 doctor 增加一条尺寸不变量，给 ctx-append 增加一个滚动分支：active canon 超过 `canon_max_bytes`（config.yaml，默认 24 KiB）时，本应写入原文件的增量改为落在一个新段里，`prev:` 串起线程历史。判定是纯字节统计，配置用既有 `parseSimpleYaml` 解析，零第三方依赖。

## Architecture

```text
配置层：.agents/context/config.yaml  ──（init.mjs 生成；缺失回落默认 24576）
                   │
写入侧：ctx-append  ──→ 读完 config，估算合并后字节数
                   ├─ ≤ 预算：原语义合并进当前 head（刷新 updated / Update Log / 镜像 / 凭据）
                   └─ > 预算：滚动 ──→ 新段三件套（同 thread/slug，prev → 旧 head，仅记增量）
                                       └─→ 旧段 superseded，索引 Active Threads / Records 迁移
校验侧：doctor.mjs  ──→ status: active 且字节数 > 预算 ──→ violation checkpoint-size
                   └─→ config.yaml 键非法 ──→ violation config-invalid
```

判定口径：

| 维度 | 方法 | 阈值 |
|---|---|---|
| 预算值 | `parseSimpleYaml(config.yaml).canon_max_bytes`，缺失回落 `DEFAULT_CANON_MAX_BYTES` | 24576 |
| 计量对象 | `Buffer.byteLength(canon, 'utf8')` | 仅 `status: active` |
| 关闭开关 | `canon_max_bytes: 0` | 跳过检查 |
| 非法值 | 非整数或 < 0 | `config-invalid` |

## Components / Composables

lib.mjs：

```ts
DEFAULT_CANON_MAX_BYTES = 24576   // 24 KiB, shared by doctor and docs
canonBytes(text) -> number        // Buffer.byteLength(text, 'utf8')
```

doctor.mjs 接线：

1. 根目录扫描时放行 `config.yaml`（不再计入 ignored note）；
2. 结构校验区读取并校验 config：`config-invalid` 处理非负整数检查；
3. base 循环内追加尺寸校验：
   ```text
   violation: checkpoint-size | <canon> | active canon is 31842 bytes > budget 24576 — roll over to a new segment
   ```
4. 既有类别、退出码、`--update-i18n` 行为不动。

init.mjs：脚手架新增 `config.yaml`：

```yaml
# ctx cache configuration (optional; built-in defaults apply when absent).
# Active canon size budget in bytes; past it a thread rolls over into a new
# segment instead of growing. 0 disables the check.
canon_max_bytes: 24576
```

## Key Decisions

### Decision 1: 只按 canon 字节数，阈值 24 KiB

**Context:** 行数会被长行绕过；镜像与凭据不在 AI 读取路径；1M 上下文时代是否该放大阈值。
**Decision:** 单一指标 `canon` UTF-8 字节数，默认 24576（用户拍板）。窗口变大不改变"摘要有界"的定位，且缓存可移植到小窗口宿主；项目级差异由 config 覆盖。**Validates: Requirements 1.1, 1.5。**

### Decision 2: 滚动段只记增量（取代语义的显式例外）

**Context:** `ctx-create` 第 7 步要求新 head 完整承接旧 head 仍有效的事实；若沿用到滚动，新段出生即接近预算，体积永远降不下来。
**Decision:** 滚动段只写增量，不承接；旧事实沿 `prev:` 可达，`ctx-resume` 明确 L3 追溯义务。代价是滚动线程的 head 不再自足，换来体积有界。**Validates: Requirements 2.2, 2.4。**

### Decision 3: 尺寸校验只约束 active，历史段豁免

**Context:** 与语言门禁"无 status 豁免"的决策看似矛盾。
**Decision:** 两者约束对象不同：语言门禁管"错误内容不能存在"，任何状态都该修；尺寸门禁管"当前读取成本有界"，历史段允许大且不应被追溯改写。**Validates: Requirements 3.1, 3.2。**

### Decision 4: config.yaml 可选、init 生成、缺失回落默认

**Context:** 老缓存没有 config；用户要求"默认初始化时给一套默认配置"。
**Decision:** `init.mjs` 生成带注释的默认值；doctor 对缺失/缺键回落内置常量，不报违约；cache-layout 契约把 `config.yaml` 列为根目录唯一允许的配置文件。**Validates: Requirements 1.2, 1.3, 1.4。**

### Decision 5: 自动滚动，不询问

**Context:** standing rule 1 要求 create/append 意图不明时必须询问。
**Decision:** 尺寸判定是确定性的，不构成意图歧义；ctx-append 自主选择合并或滚动，保持"保存一下"的单轮闭环。**Validates: Requirements 2.1, 2.6。**

## Error Handling

| Scenario | Handling |
|---|---|
| active canon 超预算 | violation `checkpoint-size`（含实际字节与预算） |
| superseded / archived 超预算 | 不报（历史豁免） |
| `canon_max_bytes: 0` | 全部豁免 |
| `canon_max_bytes` 非整数/负数 | violation `config-invalid`，回落默认值继续校验 |
| config.yaml 缺失或缺键 | 回落默认值，不报 |
| 合并将超预算 | ctx-append 走滚动分支，新段只记增量 |

## Correctness Properties

### Property 1: 预算不变量

*For any* doctor-green 缓存，所有 `status: active` 记录的 canon 字节数 ≤ 预算（预算为 0 时该性质 vacuous）。

**Validates: Requirements 1.1, 3.1**

### Property 2: 滚动链完整

*For any* 滚动产出：新段 `prev` 指向被继续段且同 `thread`；旧段 `superseded` 且失去 Records 行；Active Threads 行指向新段；新段正典 ≤ 预算且不含旧段事实。

**Validates: Requirements 2.1, 2.2, 2.3, 4.5**

### Property 3: 配置回落

*For any* 输入，config 缺失/缺键时判定与内置默认一致；非法值只影响配置本身（`config-invalid`），不改变既有规则结果与退出码协议。

**Validates: Requirements 1.2, 1.4, 3.3, 3.4**
