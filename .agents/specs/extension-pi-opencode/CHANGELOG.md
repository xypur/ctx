# extension-pi-opencode Change Log

## 2026-08-27

- 创建模块规格：requirements 3 组 / design 3 决策 2 性质 / tasks 4 条（Feature-Slice，pi 切片先行）。
- 关键决议：单仓多宿主清单共存；OpenCode 取零 JS 命令形态；激活提示常量以 hooks/ctx-activate.js 为唯一真源、pi 扩展 import 复用。

## 2026-08-27（优先级调整）

- 用户决定 pi 优先于 plugin-claude-codex：模块号 6→5，任务重编号 6.x→5.x，新增共享常量任务 5.2。
- 激活提示常量从 hooks/ctx-activate.js（插件模块）上移至 `hooks/ctx-hint.js`（本模块交付），避免后模块被前模块依赖。
- package.json name 定为 `@xypur/ctx`。

## 2026-08-27（P3 裁剪修订）

- Decision 3 rationale 中 check-adapters 指纹兜底一条移除（P3 裁剪），命令指纹核对并入 checkpoint 走查。
