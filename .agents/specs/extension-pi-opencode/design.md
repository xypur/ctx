# Design Document

## Overview

pi 是 ctx 的主要开发环境，故 pi 获得扩展级适配（命令 + 启动提示）；OpenCode 的命令文件本身足够（薄适配器的极限形态：纯 markdown，零运行时）。

## Architecture

```text
package.json                  ← pi 包声明（skills + extensions）
pi-extension/index.js         ← /ctx 命令组 + 启动提示
.opencode/command/ctx*.md     ← OpenCode 命令（零 JS）
```

## Interfaces & Data Models

pi 扩展 API（实施前先读 pi docs/packages.md、docs/extensions.md 与 ponytail pi-extension/index.js 确认）：

- package.json：name `@xypur/ctx`，`pi` 字段声明 `skills/ctx` 与 `pi-extension/index.js`；dependencies 为空。
- 命令注册：custom command 形态，展开为提示文本（同构 ponytail 的 /ponytail 命令注册）。
- 启动提示：session start 事件的上下文注入等价物。
- 提示文案：常量唯一定义于 `hooks/ctx-hint.js`（零依赖，双适配器代码级共享）；pi 优先实施，故常量由本模块（任务 5.2）交付，插件模块的 ctx-activate.js 后续 import 同一常量。

## Key Decisions

### Decision 1: 多宿主清单共存于一仓库

**Context:** 引入根 package.json 后，仓库同时含 Claude/Codex 插件清单与 pi 包清单。

**Options Considered:**
- **Option A: 按宿主分仓分发** — Cons: 割裂 skills 单一真源，同步成本高
- **Option B: 共存（ponytail 同款单仓多宿主形态）** — Pros: 各清单只引用本仓库路径，互不依赖。Effort: low

**Decision:** Option B。

**Rationale:** 单仓多宿主是 ponytail 验证过的最低维护成本形态。

### Decision 2: OpenCode 取零 JS 形态

**Options Considered:**
- **Option A: OpenCode server plugin（每轮注入）+ 命令** — Cons: ctx 是操作型 skill，无需每轮注入；引入运行时与安装成本。Effort: medium
- **Option B: 仅命令文件** — Pros: 零运行时；缺省行为（自然语言触发 skill）仍然可用。Effort: low

**Decision:** Option B。

**Rationale:** 薄适配器原则的极限形态；OpenCode 暂无等价 SessionStart 通道，宁可缺省也不引运行时。

### Decision 3: 提示文案代码级共享，常量置上游

**Decision:** 激活提示常量唯一定义于 `hooks/ctx-hint.js`（本模块任务 5.2 交付），pi 扩展与插件模块的 ctx-activate.js 均 import。

**Rationale:** 跨宿主文案漂移是最常见的适配层腐化，代码级共享根治。pi 优先实施意味着常量不能挂在后交付的插件模块里；`hooks/` 目录是两个适配器共同的中性路径，归属中立，避免后模块被前模块依赖。

## Error Handling

| Scenario | Handling |
|----------|----------|
| pi 包环境无 .agents/context | 扩展静默，不注入 |
| OpenCode 命令在无 skill 支持的项目调用 | 薄模板指示读取 SKILL.md，路径不存在时由 Agent 报告缺失，不静默伪造 |

## Correctness Properties

### Property 1: 五命令全宿主等价

*For any* 宿主（Claude/Codex/pi/OpenCode），五条命令的展开语义（读 SKILL.md + 操作名 + 参数）一致，差异仅在宿主文件格式。

**Validates: Requirements 2.1, 3.1**

### Property 2: 无缓存零信号（扩展侧）

*For any* 不含根索引的项目，pi 扩展不注入提示、不产生副作用。

**Validates: Requirements 2.2**
