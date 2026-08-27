# Implementation Plan: extension-pi-opencode

## Overview

策略：Feature-Slice——包声明 → 共享提示常量 → pi 扩展 → OpenCode 命令四个切片，最后以安装走查收口。本模块优先于 plugin-claude-codex（用户决定：pi 先行，Codex/Claude 后）。

## Tasks

## Phase 1: pi 切片

- [ ] 5.1 根 package.json（pi 包声明）
  - name `@xypur/ctx`、pi.skills / pi.extensions 字段；零依赖
  - _Requirements: 1.1, 1.2, 1.3_
- [ ] 5.2 hooks/ctx-hint.js 共享常量
  - 激活提示文案 + 根索引检测辅助；双适配器唯一真源
  - _Requirements: 2.2_
- [ ] 5.3 pi-extension/index.js
  - 五命令注册 + 启动提示（import ctx-hint 常量）；静默降级
  - _Requirements: 2.1, 2.2, 2.3_

## Phase 2: OpenCode 切片

- [ ] 5.4 .opencode/command/ 五命令文件
  - 薄模板、零 JS、登记矩阵
  - _Requirements: 3.1, 3.2, 3.3_
- [ ] 5.5 Checkpoint — 安装与等价走查
  - _Requirements: 1.x, 2.x, 3.x_
  - pi 安装走查（skill 可见 + 命令可用 + 提示注入）；四宿主命令展开语义对账。结果向用户汇报后再勾选。

## Notes

- 5.1/5.3 前先读 pi docs/packages.md、docs/extensions.md 与 ponytail pi-extension/index.js，确认 API 后再动手。
- 共享常量落在本模块（pi 优先）而非插件模块：`hooks/ctx-hint.js` 是两个适配器的中性路径，避免后模块被前模块依赖。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["5.1", "5.2"] },
    { "id": 1, "tasks": ["5.3", "5.4"] },
    { "id": 2, "tasks": ["5.5"] }
  ]
}
```

Task status is maintained in `.agents/specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
