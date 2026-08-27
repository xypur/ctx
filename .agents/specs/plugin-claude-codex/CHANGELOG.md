# plugin-claude-codex Change Log

## 2026-08-27

- 创建模块规格：requirements 4 组 / design 3 决策 2 性质 / tasks 4 条（Risk-First，hook 先行）。
- 关键决议：检测信号取根索引存在性（与 init 产出物一致）；注入走 additionalContext 结构化通道；提示常量以 hooks/ctx-activate.js 为跨宿主唯一真源。

## 2026-08-27（优先级调整）

- 用户决定本模块延后至 extension-pi-opencode 之后：模块号 5→6，任务重编号 5.x→6.x。
- 激活提示常量改由 `hooks/ctx-hint.js`（extension-pi-opencode 先行交付）提供，ctx-activate.js import 之，不再自定义。
- 模块内宿主顺序调整为 Codex 先、Claude 后（Requirement 1 与任务 6.3 均按此排序）。

## 2026-08-27（P3 裁剪修订）

- Req 1.3 清单路径存在性的核对方式由 check-adapters 改为模块 checkpoint 走查。
