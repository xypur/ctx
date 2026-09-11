# Requirements Document

## Introduction

双语三件套中的"英文正典"在实践中退化为「英文壳 + 中文正文」：astro-minima 的一份 active 检查点，正典正文 CJK 字符占 39.7%，与镜像 67% 的行逐字节相同，而 doctor 全绿——双语机制整体失效：正典既不是英文，镜像也没有人类增量价值。本模块把语言契约从写作倡议升级为 doctor 硬门禁，并确立「镜像 = 结构孪生」。

用户已确认四项决议：①canon 严格零 CJK（代码豁免）；②不做 canon 体积门禁；③不做 status 豁免（统一适用，不追溯改写历史文件）；④镜像 CJK 占比下限 30%。astro-minima 的既有文件不在本次改写范围内。

## Glossary

- **正典（canon）**：`<base>.md`，AI 默认读取的英文版本，唯一权威。
- **镜像（mirror）**：`<base>.zh.md`，供人类阅读的中文版本。
- **代码豁免（code exemption）**：语言判定前剔除的代码围栏与行内 code span——需要引用中文原文、UI 文案或用户原话时，放入反引号即可承载。
- **结构孪生（structural twin）**：镜像与正典在 front matter、H1、`##`/`###` 标题序列、Requirements 表 ID 序列上逐项一致。
- **假英文（fake English）**：英文标题骨架 + 中文正文的混合文档，是本模块要消灭的失效形态。

## Requirements

### Requirement 1：语言契约

**User Story:** 作为默认读取正典的 Agent，我希望正典是紧凑的真英文，使恢复路径的读取体积与可读性符合设计预期。

#### Acceptance Criteria

1. 正典（含 front matter）在剔除代码围栏与行内 code span 后 SHALL 零 CJK 字符：U+2E80–2EFF、U+3000–303F、U+3040–U+30FF、U+3400–U+4DBF、U+4E00–U+9FFF、U+F900–U+FAFF、U+FE30–U+FE4F、U+FF00–U+FFEF（含全角标点）。
2. WHEN 需要引用中文原文、中文 UI 文案或用户原话，THEN 正典 SHALL 用行内 code 或代码围栏承载。
3. 正典的 `next:` 等自然语言 front matter 字段 SHALL 为英文（属 AC 1.1 检查范围）。
4. 镜像在同样剔除代码后，CJK 字符数占「CJK 字符 + 拉丁字母」总数的比例 SHALL ≥ 30%。
5. 镜像 SHALL 是正典的结构孪生：
   - front matter 键集合逐字段相等；除 `next` 允许中文译文外，各字段值逐项相等；
   - H1 等于「正典 H1 + `（中文镜像）`」；
   - `##`/`###` 标题序列逐项相同（类型节名与子字段名保持英文，不翻译）；
   - Requirements 表 ID 序列逐项相同。
6. 结构关键词（类型节名、子字段名、状态枚举、front matter 键名）SHALL 在正典与镜像两侧逐字保持英文。

### Requirement 2：doctor 语言门禁

**User Story:** 作为维护者，我希望语言契约可被机械判定，使假英文在写入当场变红，而不是靠事后人工发现。

#### Acceptance Criteria

1. doctor SHALL 新增 `canon-language` 校验：正典剔除代码后 CJK 计数 > 0 计 violation，消息 SHALL 含 CJK 计数。
2. doctor SHALL 新增 `mirror-language` 校验：镜像占比低于阈值计 violation，消息 SHALL 含实际占比与阈值。
3. doctor SHALL 新增 `mirror-structure` 校验：Requirement 1.5 的四个对齐维度不一致时逐项计 violation，消息 SHALL 指明不一致维度。
4. 校验范围 SHALL 覆盖全部检查点记录，不按 `status` 豁免；WHEN companion（`.zh.md`）缺失，THEN 以既有 `triplet-missing` 为准，语言与结构校验跳过、不重复计违约。
5. 既有退出码协议（0/1/2）、violation 输出格式（`violation: <category> | <file> | <detail>`）、`--update-i18n` 行为 SHALL 保持不变。
6. 判定规则 SHALL 只用 Node 内置能力实现，不引入第三方依赖。

### Requirement 3：流程与文档联动

**User Story:** 作为执行 ctx-create / ctx-append 的 Agent，我希望成文纪律与验收环写死在工作流里，使门禁真正被触发。

#### Acceptance Criteria

1. SKILL.md standing rule 4 SHALL 改写为 English-first 成文纪律：正典直接以英文成文（禁止先写中文草稿再翻译标题）、镜像从成品正典派生、结构关键词两侧保持英文。
2. ctx-create 与 ctx-append 的步骤 SHALL 以「运行 `doctor.mjs`、修至 healthy」收尾。
3. checkpoint-format.md SHALL 新增 Language contract 小节（判定规则 / 代码豁免 / 阈值 / 结构孪生 / 示例）；file-naming.md 的双语三件套一节与 docs/ctx-understanding.md §10 SHALL 同步门禁描述。
4. skills-zh/ctx/ 的 SKILL.zh.md 与 references/*.zh.md SHALL 在同一实现提交内同步。
5. examples/ 两个样例三件套与 `.agents/context/` 现有记录 SHALL 在新门禁下全绿（按需为示例镜像补 front matter、对齐标题与凭据）。astro-minima 项目文件不在本次改写范围内。

### Requirement 4：证据与回归

**User Story:** 作为验收者，我希望新门禁有可复现的负例命中与正例全绿证据。

#### Acceptance Criteria

1. 负例注入 SHALL 逐类命中：`canon-language`、`mirror-language`、`mirror-structure` 各至少 2 个变体（如正典中文正文、`next:` 中文；镜像未翻译、镜像结构漂移）。
2. 正例回归 SHALL 全绿：examples/login-redesign、examples/csv-import、`.agents/context` 三处 doctor 退出码 0；既有规则类别零新增违约（astro-minima 目录预期新增违约，属符合行为，不作为回归样本）。
3. 全链走查 SHALL 覆盖 create → append：含镜像生成、doctor 收尾、`--update-i18n` 凭据刷新。
