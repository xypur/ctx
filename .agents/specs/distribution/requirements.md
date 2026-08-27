# Requirements Document

## Introduction

为 ctx 建立对 AI Agent 工具的最低分发面：根 AGENTS.md（always-on 指令正典）、docs/agent-portability.md（适配矩阵）、README 双语（安装与定位）。本模块是后续所有宿主适配器（插件 / 扩展 / 规则副本）的正典来源，遵循 ponytail Adapter Rule：核心行为只存在于 skills/ctx，适配器保持薄。

## Glossary

- **分发面（distribution surface）**：一个宿主 Agent 无需读源码即可发现、安装、触发 ctx 的全部入口文件。
- **instruction-tier**：仅靠项目指令文件（AGENTS.md / 规则副本）承载的适配层级，无运行时代码。
- **resume 发现性**：新会话中的 Agent 在用户未显式说出操作名时仍能得知「存在可恢复的缓存」的能力。

## Requirements

### Requirement 1：README 分发入口

**User Story:** 作为第一次接触 ctx 的用户，我希望仅凭 README 判断 ctx 是否适用，并找到我的宿主对应的安装方式。

#### Acceptance Criteria

1. README SHALL 包含：一句话定位、五操作一览、缓存目录形态示意、按宿主的安装方式索引（链接 agent-portability 矩阵）、与 ponytail 的关系声明（借鉴其 Adapter Rule；行为域不同：行为模式 vs 会话记忆）。
2. README SHALL 提供英文正典 `README.md` 与中文镜像 `README.zh.md`，两者信息等价。
3. WHEN 安装索引行指向的适配文件缺失时，SHALL 能在模块 checkpoint 走查中发现该缺失（矩阵即规格，走查对账）。

### Requirement 2：根 AGENTS.md always-on 正典

**User Story:** 作为在新会话中打开本仓库的 Agent，我希望无需用户提示就能得知 ctx 缓存的存在与恢复入口。

#### Acceptance Criteria

1. 仓库根 SHALL 提供 `AGENTS.md`，内容包含：(a) 本仓库工作约定；(b) ctx 紧凑操作表（五操作 + 触发场景）；(c) resume 指针——恢复既往工作先读 `.agents/context/index.md`。
2. AGENTS.md SHALL NOT 内嵌 checkpoint 格式或完整操作流程细节（渐进披露：细节留给 skills/ctx/references/）。
3. AGENTS.md SHALL 作为 instruction-tier 适配的唯一派生正典（未来若增设规则副本，从这里派生）。
4. WHEN Agent 遵循 AGENTS.md 的 resume 指针时，SHALL 能在不读取 SKILL.md 的情况下找到根索引。

### Requirement 3：agent-portability 适配矩阵

**User Story:** 作为适配器作者与维护者，我需要一份与实物强一致的矩阵文档，防止适配层发散。

#### Acceptance Criteria

1. `docs/agent-portability.md` SHALL 逐宿主列出：适配文件路径、适配层级（instruction / command / plugin / extension）、安装方式、是否提供会话启动提示。
2. 矩阵 SHALL 声明 Adapter Rule：核心行为只保留在 skills/ctx，宿主适配器只提供入口，不复制缓存规则。
3. 矩阵每行的文件路径 SHALL 与仓库实际文件一一对应（由各模块 checkpoint 走查对账核对）。
