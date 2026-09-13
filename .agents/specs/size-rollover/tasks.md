# Implementation Plan: size-rollover

## Overview

策略：Foundation-First——尺寸与滚动契约先在文档层冻结，lib/doctor 与 init 脚手架并行跟进，示例与镜像对齐后注入回归，全链走查收口。

## Tasks

## Phase 1: 契约冻结

- [x] 9.1 尺寸与滚动契约文档冻结
  - checkpoint-format.md 新增 Size budget and rollover 小节（预算口径/豁免/滚动算法/段链自足性）；cache-layout.md 加入 config.yaml 条款与键说明；file-naming.md 段命名说明；SKILL.md 增加 standing rule、ctx-append 滚动分支、ctx-create 预算约束、ctx-resume 追溯说明；docs/ctx-understanding.md §9/§10 同步；skills-zh 四份镜像同步
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.2_

## Phase 2: 实现

- [x] 9.2 lib.mjs 预算常量
  - `DEFAULT_CANON_MAX_BYTES = 24576`、`canonBytes(text)`
  - _Requirements: 1.1, 1.5_
- [x] 9.3 doctor 尺寸与配置校验
  - 放行 `config.yaml` 根条目；解析校验 `canon_max_bytes`（`config-invalid`）；`checkpoint-size` 仅对 active 生效、0 关闭；既有类别与退出码不动
  - _Requirements: 1.4, 3.1, 3.2, 3.3, 3.4_
- [x] 9.4 init 脚手架与示例
  - init.mjs 生成带注释的 config.yaml；examples/empty-skeleton 同步（含示例 README 提及）
  - _Requirements: 1.3, 4.3_

## Phase 3: 证据与验收

- [x] 9.5 注入回归 + 滚动走查
  - 结果（2026-09-11）：注入 13/13（超预算 active 红、superseded 豁免、0 关闭、config-invalid、init 脚手架、滚动走查 7 项）；语言门禁回归通过；四目录全绿
  - 负例：超预算 active 红、superseded 豁免、0 关闭、config-invalid；正例：examples ×2 + .agents/context 全绿；滚动走查：append 触发滚动、新段/prev/superseded/索引/凭据/doctor 全对，并验证 resume 沿 prev 追溯
  - _Requirements: 4.4, 4.5_
- [ ] 9.6 Checkpoint — 全链走查
  - 结果向用户汇报后再勾选
  - _Requirements: 1.x, 2.x, 3.x, 4.x_

## Notes

- 排序依据：9.1 是 9.3/9.4 的派生源；9.2 先行供 9.3 使用；9.4 与 9.3 可并行；9.5 必须在 9.3/9.4 生效后进行。
- 用户决议：方案 A（滚动只记增量）；canon 字节阈值 24 KiB；config.yaml + init 默认生成；滚动自动执行。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["9.1", "9.2"] },
    { "id": 1, "tasks": ["9.3", "9.4"] },
    { "id": 2, "tasks": ["9.5"] },
    { "id": 3, "tasks": ["9.6"] }
  ]
}
```

Task status is maintained in `.agents/specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
