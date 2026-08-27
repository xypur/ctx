# Requirements Document

## Introduction

为 ctx 缓存提供确定性维护与校验脚本：`init`（生成骨架）、`doctor`（结构与双语凭据校验）。脚本是本阶段唯一的可执行代码，供开发期与未来 CI/检查点调用。

## Glossary

- **doctor**：只读校验器；除显式 `--update` 外不修改任何文件。
- **违规类别（violation）**：doctor 输出的最小报告单位。

## Requirements

### Requirement 1：init 骨架生成

**User Story:** 作为接入新项目的 AI Agent，我希望一条命令得到合法的空缓存骨架。

#### Acceptance Criteria

1. WHEN 运行 `init <root>` 时，THE 脚本 SHALL 创建 `<root>/index.md` 与 `<root>/archive/index.md`，内容与 cache-contract 的索引模板一致。
2. IF 目标文件已存在，THEN init SHALL 拒绝覆盖并以非零退出码提示。
3. 除此之外 THE 脚本 SHALL NOT 创建任何子目录或示例文件（保持布局纯度）。

### Requirement 2：doctor 结构校验

**User Story:** 作为维护者，我希望一条命令穷尽地检出契约违约。

#### Acceptance Criteria

1. doctor SHALL 校验：front matter 字段完整性与枚举合法性、tags 受控词表、文件命名格式、三件套齐备、根索引↔active 文档双向覆盖、每 thread 至多一个 head、prev 指向存在文档或 null、status 值合法。
2. WHEN 发现任一违约时，doctor SHALL 逐条输出 `violation: 类别 | 文件 | 说明` 并以非零退出码结束。
3. WHEN 全部通过时，doctor SHALL 输出汇总（扫描文件数 / 通过项）且退出码为 0。
4. doctor 校验范围 SHALL 为 `.agents/context/**`（含 archive/），跳过非三件套样式的杂项时 SHALL 报告 ignored 清单而非静默忽略。

### Requirement 3：i18n 凭据校验

**User Story:** 作为中英双语的共同作者，我需要机器证明两侧处于最近确认一致的状态。

#### Acceptance Criteria

1. doctor SHALL 对每个 `.i18n.yaml` 比较 `.md` 与 `.zh.md` 当前 git blob hash 与其记录值，分别输出 en/zh 的 synced 或 stale 结论到汇总。
2. WHEN 任一侧 hash 不匹配时，THE 结果 SHALL 计入一个 `i18n-stale` violation 并影响退出码。
3. WHEN 以 `--update-i18n` 显式运行时，doctor SHALL 把当前双侧 blob hash 写回各 `.i18n.yaml`，此为唯一允许的写路径。

### Requirement 4：输出协议与安全

**User Story:** 作为把 doctor 挂进工作流的使用者，我需要稳定可编程的接口边界。

#### Acceptance Criteria

1. 退出码协议 SHALL 为：0 = healthy；1 = 存在 violation；2 = 自身无法运行（参数错误、git 不可用等）。
2. 除 `--update-i18n` 外，运行 doctor SHALL NOT 改变任何文件（可通过 git status 前后对比验证）。
3. 脚本 SHALL 仅使用零第三方依赖的实现方式在主流宿主环境直接运行。

### Requirement 5：init 与 doctor 的一致性闭环

**User Story:** 作为开发者，我期待 init 产出的骨架必然通过 doctor。

#### Acceptance Criteria

1. WHEN 对刚执行完 init 的空缓存目录运行 doctor 时，doctor SHALL 以退出码 0 通过（“空而健康”）。
