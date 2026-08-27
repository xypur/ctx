# Requirements Document

## Introduction

为 pi 与 OpenCode 提供适配：根 package.json 使 ctx 成为可安装的 pi 包，pi 扩展注册命令与会话启动提示，OpenCode 以零 JS 的命令文件适配。行为与模块 plugin-claude-codex 等价，适配层保持薄。

## Glossary

- **pi 包**：带 `pi` 字段的 package.json，可被 pi 的包管理安装，声明 skills 与 extensions。

## Requirements

### Requirement 1：pi 包分发

**User Story:** 作为 pi 用户，我希望一条安装命令让 ctx 的 skill 与命令进入我的所有会话。

#### Acceptance Criteria

1. 仓库根 SHALL 提供名为 `@xypur/ctx` 的 package.json，以 pi 包字段声明 skills/ctx 与 pi-extension。
2. WHEN 用户以 pi 的包安装方式安装本仓库，THEN ctx skill SHALL 进入技能发现范围，扩展 SHALL 被加载。
3. package.json SHALL NOT 引入第三方 runtime 依赖（dependencies 为空）。

### Requirement 2：pi 扩展命令与启动提示

**User Story:** 作为 pi 用户，我希望 /ctx-resume 等命令与启动提示在 pi 内与其他宿主行为一致。

#### Acceptance Criteria

1. pi-extension SHALL 注册五条命令（/ctx、/ctx-create、/ctx-append、/ctx-resume、/ctx-archive），展开语义与模块 plugin-claude-codex 的命令等价。
2. WHEN pi 会话启动且 `.agents/context/index.md` 存在，THEN 扩展 SHALL 注入 `hooks/ctx-hint.js` 共享常量的激活提示（与插件模块的 hook 同源）；不存在时 SHALL 静默。
3. 扩展 SHALL NOT 内嵌操作规则正文。

### Requirement 3：OpenCode 适配

**User Story:** 作为 OpenCode 用户，我希望 ctx 命令无需任何 JS 运行时即可使用。

#### Acceptance Criteria

1. SHALL 以 OpenCode 命令文件形态提供五条命令（`.opencode/command/`），展开语义与其他宿主等价。
2. 本模块的 OpenCode 适配 SHALL NOT 包含 JS 插件（零运行时；如宿主未来具备注入通道再立新模块）。
3. 适配文件路径 SHALL 登记进 agent-portability 矩阵。
