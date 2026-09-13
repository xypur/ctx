# Requirements Document

## Introduction

检查点没有尺寸约束：`ctx-append` 会把同一会话的增量永久合并进同一文件，`## Update Log` 每追加一行就长一行——长会话的膨胀是必然的，而 `ctx-resume` 每次都要读整个 head。本模块给 active canon 设定字节预算，超预算时线程**滚动**为下一段（同 thread、`prev:` 链接），使 AI 的每次恢复读取成本有界，同时历史沿链完整保留。

用户已确认四项决议：①滚动段**只记增量**（取代语义的显式例外，旧事实靠 `prev` + L3 追溯）；②阈值只按 canon 字节数，默认 **24 KiB**；③配置走 `.agents/context/config.yaml`，由 `init.mjs` 生成默认值；④滚动自动执行，不触发 create/append 询问。

## Glossary

- **尺寸预算（size budget）**：active canon 允许的最大字节数，来自 `config.yaml` 的 `canon_max_bytes`（默认 24576；`0` 关闭检查）。
- **滚动（rollover）**：active canon 合并增量将超预算时，不增长原文件，而是新建同线程的下一段检查点。
- **段（segment）**：滚动线程中的一个检查点；同 `thread`、同 slug，以时间戳命名区分，`prev:` 串成链。
- **段链自足性**：滚动后 head 只保证包含最新一段的事实；更早的仍有效事实沿 `prev:` 链可达（与常规取代不同）。

## Requirements

### Requirement 1：尺寸预算契约

**User Story:** 作为恢复工作的 Agent，我希望 active head 的读取体积有硬上限，使每次 resume 的成本可预期且不随会话长度无限增长。

#### Acceptance Criteria

1. ACTIVE 检查点的 canon 字节数（UTF-8）SHALL ≤ `canon_max_bytes`；阈值定义在 `<ctx-root>/config.yaml`，默认 24576（24 KiB），`0` 表示关闭检查。
2. WHEN `<ctx-root>/config.yaml` 缺失或未写 `canon_max_bytes`，THEN 使用内置默认值，不报违约。
3. `config.yaml` SHALL 是 cache 根目录唯一允许的配置文件（修订 cache-layout 契约）；`init.mjs` SHALL 生成带注释与默认值的脚手架。
4. `canon_max_bytes` 取值 SHALL 为非负整数；否则计 violation（新类别 `config-invalid`）。
5. 镜像与 `.i18n.yaml` SHALL NOT 参与尺寸计量——预算只约束 AI 读取路径（canon）。

### Requirement 2：滚动契约

**User Story:** 作为执行 ctx-append 的 Agent，我希望超预算时自动滚动，使文件体积有界而历史不丢失。

#### Acceptance Criteria

1. WHEN 合并增量会使 active canon 超预算，THEN ctx-append SHALL 改为滚动而非增长原文件：新建同 `thread`、同 slug 的下一段三件套（新时间戳名，同分钟冲突沿用 `-NN`），`prev:` 指向被继续的段，`head: true`、`status: active`。
2. 滚动段正文 SHALL 只承载本次增量，SHALL NOT 复制旧段仍有效的事实——这是取代语义的显式例外；旧事实沿 `prev:` 链可达。
3. 滚动后：旧段 SHALL 标为 `superseded`、失去根索引 Records 行；根索引 Active Threads 行 SHALL 指向新段；新段 SHALL 拥有自己的 Records 行。
4. `ctx-resume` SHALL 明确：滚动线程的 head 只含最新一段，L2 缺事实时沿 `prev:`（L3）追溯。
5. `ctx-create` 的正典 SHALL 同样落在预算内：优先缩紧摘要；单次压缩确实无法容纳时 SHALL 拆分为链式段。
6. 滚动 SHALL 自动执行，不因尺寸判定触发「create 还是 append」的询问规则。

### Requirement 3：doctor 校验

**User Story:** 作为维护者，我希望预算可被机械校验，使超预算的 active head 无法蒙混过验收。

#### Acceptance Criteria

1. doctor SHALL 新增 `checkpoint-size` 校验：`status: active` 且 canon 字节数 > 预算的记录计 violation，消息 SHALL 含实际字节数与预算。
2. `superseded` / `archived` 记录 SHALL 豁免尺寸校验（历史段允许大）；`canon_max_bytes: 0` WHEN 出现 THEN 全部记录豁免。
3. doctor SHALL 把 `config.yaml` 识别为合法根条目（不再计入 ignored note）。
4. 既有类别、退出码协议（0/1/2）、violation 输出格式 SHALL 不变；实现 SHALL 只用 Node 内置能力。

### Requirement 4：文档、示例与证据

**User Story:** 作为验收者，我希望契约、脚手架、镜像与证据一次改齐。

#### Acceptance Criteria

1. `SKILL.md` SHALL 增加预算与滚动的 standing rule、ctx-append 的滚动算法、ctx-resume 的追溯说明；`checkpoint-format.md`、`file-naming.md`（段命名）、`cache-layout.md`（config.yaml 条款）、`docs/ctx-understanding.md` SHALL 同步。
2. `skills-zh/ctx/` 相关镜像 SHALL 在同一实现提交内同步。
3. `init.mjs` 生成的脚手架与 `examples/empty-skeleton/` SHALL 一致（含 `config.yaml`）；示例 README SHALL 提及。
4. 负例注入 SHALL 覆盖：超预算 active 变红、superseded 豁免、`0` 关闭、`config-invalid`（各至少 1 例）；正例回归（examples ×2 + `.agents/context`）SHALL 全绿。
5. 滚动走查 SHALL 覆盖：append 触发滚动 → 新段三件套成立、`prev:` 指向旧段、旧段 superseded、索引行迁移、凭据刷新、doctor 退出码 0。
