# Implementation Plan: plugin-claude-codex

## Overview

策略：Risk-First——hook 注入协议是本模块唯一含运行时行为的部分，先行实现并 fixture 验证；命令与清单是指针性文件，随后收口。本模块位于 extension-pi-opencode 之后（用户决定：pi 先行）。模块内宿主顺序 Codex 先、Claude 后。

## Tasks

## Phase 1: hook 与命令

- [x] 6.1 hooks/ctx-activate.js
  - 根索引存在性检测、additionalContext 注入、静默降级、零依赖；提示文案 import 自 hooks/ctx-hint.js
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3_
- [x] 6.2 命令五条 × 两宿主形态
  - 薄模板；两形态操作名集合等价
  - _Requirements: 3.1, 3.2, 3.3_
- [x] 6.3 插件清单与 marketplace（Codex 先、Claude 后）
  - .codex-plugin ×1 → .claude-plugin ×2；路径指针齐备
  - _Requirements: 1.1, 1.2, 1.3_
- [x] 6.4 Checkpoint — 安装与注入走查
  - _Requirements: 1.x, 2.x, 3.x, 4.x_
  - fixture 目录有/无缓存各跑一次 hook，验证注入内容与零副作用；清单字段走查；命令展开语义抽查。结果向用户汇报后再勾选。

## Notes

- 实施前先读 ponytail `hooks/ponytail-activate.js` 与 `hooks/claude-codex-hooks.json` 确认 SessionStart 协议细节，ctx 仅替换检测信号；提示常量已由 hooks/ctx-hint.js 提供，不重新定义。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["6.1", "6.2"] },
    { "id": 1, "tasks": ["6.3"] },
    { "id": 2, "tasks": ["6.4"] }
  ]
}
```

Task status is maintained in `.agents/specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
