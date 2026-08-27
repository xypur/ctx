# Implementation Plan: cache-contract

## Overview

把 docs/ctx-understanding.md §3–§8、§10 的静态约定落成 skill 内的三个 reference 文档。策略：Foundation-First——本模块是全部后续工作的地基，先行完成并通过审阅 gate。

## Tasks

## Phase 1: 静态契约文档化

- [x] 1.1 编写 `references/cache-layout.md`（布局与索引契约）
  - 扁平布局图、初始化清单（root/archive 两个 index 的完整模板内嵌）
  - 根索引三组成部分、归档索引一行式条目规范
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 6.1, 6.2_
- [x] 1.2 编写 `references/file-naming.md`（命名与双语契约）
  - 命名格式、-NN 冲突后缀、slug 规则、三件套关系、`.i18n.yaml` 结构与“先同步后更新”流程
  - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3_
- [x] 1.3 编写 `references/checkpoint-format.md`（front matter 与正文骨架）
  - YAML schema 注释版模板、六节正文骨架、写作规则（几十行、省略空节）、需求状态与验证状态枚举及诚实性条款
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 1.4 Checkpoint — 契约审阅
  - _Requirements: 1.x, 2.x, 3.x, 4.x, 5.x, 6.x, 7.x_
  - 对照 docs/ctx-understanding.md 通读三份 reference，逐条核对验收标准；让用户（或第二次独立通读）确认措辞无冲突后勾选，作为下游两模块的放行 gate。

## Notes

- 排序策略：Foundation-First（详见 Overview）
- 所有产物均为 Markdown 文档，不做任何脚本实现（脚本属 tooling 模块）

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4"] }
  ]
}
```

Task status is maintained in `.specs/index.md`, which derives progress, the next task, and the next gate from task checkboxes and dependencies. Do not add a module-local status block.
