# Requirements Document

## Introduction

为 Claude Code 与 Codex 提供插件级适配：插件清单、SessionStart hook（resume 发现性）与五操作斜杠命令。适配层保持薄：hook 只注入发现性提示，命令只派发到 skills/ctx。

## Glossary

- **激活提示（activation hint）**：SessionStart hook 注入的一行上下文，告知 Agent 缓存存在与恢复入口。
- **薄命令**：命令模板不复制操作规则正文，仅指向 SKILL.md 对应操作段。

## Requirements

### Requirement 1：插件清单

**User Story:** 作为 Claude Code / Codex 用户，我希望用一次插件安装获得 ctx 的命令与 hook。

#### Acceptance Criteria

1. `.codex-plugin/plugin.json` SHALL 以 Codex 插件形态声明 ctx 插件能力面。
2. `.claude-plugin/plugin.json` SHALL 声明 ctx 插件（名称、描述、skills/hooks/commands 指针），`.claude-plugin/marketplace.json` SHALL 支持 marketplace 安装路径。
3. 两份清单引用的全部文件路径 SHALL 真实存在（由模块 checkpoint 走查核对）。

### Requirement 2：SessionStart 激活提示

**User Story:** 作为回到项目的用户，我希望新会话的 Agent 自己知道有可恢复的上下文，而不必我记得说「恢复上下文」。

#### Acceptance Criteria

1. WHEN 会话启动时 `<cwd>/.agents/context/index.md` 存在，THE hook SHALL 向会话注入一条提示：缓存存在、根索引路径、恢复先读索引。
2. IF 该文件不存在，THEN hook SHALL 静默（不注入、不建目录、不改文件）。
3. THE hook SHALL 以只读方式工作，除注入提示外 SHALL NOT 产生任何副作用。
4. 提示 SHALL 为常量文本 + 实际路径拼接，SHALL NOT 读取或转述索引内容（内容按 ctx-resume 渐进披露按需读取）。

### Requirement 3：斜杠命令

**User Story:** 作为熟练用户，我希望用 /ctx-resume 等命令显式驱动操作，而不依赖自然语言触发。

#### Acceptance Criteria

1. SHALL 提供五条命令：/ctx（状态）、/ctx-create、/ctx-append、/ctx-resume、/ctx-archive，覆盖 SKILL.md 操作表全集。
2. 每条命令的展开提示 SHALL 为「读取 skills/ctx/SKILL.md 的对应操作节并按其执行，参数为 $ARGUMENTS」形态，SHALL NOT 内嵌操作规则正文。
3. 命令 SHALL 同时提供 Claude Code 形态与 Codex 形态，两形态展开语义等价。

### Requirement 4：运行时约束

**User Story:** 作为把插件装进任意环境的用户，我不希望适配层引入新的故障面。

#### Acceptance Criteria

1. hook SHALL 为零第三方依赖的 Node 脚本（与 skills/ctx/scripts 同纪律）。
2. hook SHALL 在 5 秒内完成（宿主 timeout 配置 ≤5s）。
3. IF node 不可用或 hook 抛错，THEN 宿主会话 SHALL 不中断（静默降级，skill 自然语言触发路径继续可用）。
